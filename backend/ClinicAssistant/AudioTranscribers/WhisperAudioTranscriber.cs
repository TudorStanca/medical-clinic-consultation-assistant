using System.Collections.Concurrent;
using System.Diagnostics;
using ClinicAssistant.Configuration;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Service.Interfaces;
using log4net;
using Microsoft.Extensions.Options;
using Whisper.net;
using Whisper.net.Ggml;
using Whisper.net.LibraryLoader;

namespace ClinicAssistant.AudioTranscribers;

public class WhisperAudioTranscriber : IAudioTranscriber, IAsyncDisposable
{
    private static readonly ILog Log = LogManager.GetLogger(typeof(WhisperAudioTranscriber));

    // WebmHeader: bytes from chunk 1 up to (not including) the first Cluster element.
    // Prepending this to any subsequent chunk makes it a valid standalone WebM.
    private record SessionState(byte[] WebmHeader, long AccumulatedMs);

    private readonly ConcurrentDictionary<Guid, SessionState> _sessions = new();
    private readonly ConcurrentDictionary<Guid, SemaphoreSlim> _sessionLocks = new();
    private readonly WhisperSettings _settings;
    private readonly WhisperFactory _factory;

    public WhisperAudioTranscriber(IOptions<WhisperSettings> options)
    {
        _settings = options.Value;

        var modelPath = Path.Combine(AppContext.BaseDirectory, _settings.ModelPath);

        if (!File.Exists(modelPath))
        {
            Log.Info($"Whisper model not found at {modelPath}. Downloading ggml-medium...");
            Directory.CreateDirectory(Path.GetDirectoryName(modelPath)!);
            DownloadModelAsync(modelPath).GetAwaiter().GetResult();
            Log.Info("Whisper model download complete.");
        }

        if (_settings.UseCuda)
        {
            Log.Info("UseCuda=true — initializing CUDA runtime.");
            RuntimeOptions.RuntimeLibraryOrder = [RuntimeLibrary.Cuda];
            _factory = WhisperFactory.FromPath(modelPath, new WhisperFactoryOptions { GpuDevice = 0 });
            Log.Info("WhisperFactory initialized with CUDA.");
        }
        else
        {
            Log.Info("UseCuda=false — initializing CPU runtime.");
            RuntimeOptions.RuntimeLibraryOrder = [RuntimeLibrary.Cpu];
            _factory = WhisperFactory.FromPath(modelPath);
            Log.Info("WhisperFactory initialized with CPU.");
        }
        Log.Info($"WhisperFactory initialized from {modelPath}");
    }

    private static async Task DownloadModelAsync(string modelPath)
    {
        using var modelStream = await WhisperGgmlDownloader.Default.GetGgmlModelAsync(GgmlType.Medium);
        using var fileStream = File.OpenWrite(modelPath);
        await modelStream.CopyToAsync(fileStream);
    }

    public async Task<IReadOnlyList<TranscriptSegment>> TranscribeChunkAsync(
        Guid sessionId, string audioPath, CancellationToken ct)
    {
        var chunkBytes = await File.ReadAllBytesAsync(audioPath, ct);

        var semaphore = _sessionLocks.GetOrAdd(sessionId, _ => new SemaphoreSlim(1, 1));
        await semaphore.WaitAsync(ct);
        try
        {
            byte[] webmToProcess;
            long offsetMs;
            byte[] webmHeader;
            long accumulatedMs;

            if (!_sessions.TryGetValue(sessionId, out var state))
            {
                // First chunk: extract the EBML+Segment header (everything before Cluster #1)
                webmHeader = ExtractWebmHeader(chunkBytes);
                webmToProcess = chunkBytes;
                offsetMs = 0;
                accumulatedMs = 0;
                Log.Info($"Session {sessionId}: first chunk, extracted {webmHeader.Length} bytes of WebM header.");
            }
            else
            {
                webmHeader = state.WebmHeader;
                // Prepend header so FFmpeg sees a valid WebM containing just this cluster
                webmToProcess = CombineBytes(webmHeader, chunkBytes);
                offsetMs = state.AccumulatedMs;
                accumulatedMs = state.AccumulatedMs;
            }

            Log.Info($"Session {sessionId}: FFmpeg converting chunk ({chunkBytes.Length / 1024} KB, offset {offsetMs} ms)...");
            var wavBytes = await ConvertWebMToWavAsync(webmToProcess, ct);
            Log.Info($"Session {sessionId}: FFmpeg done, {wavBytes.Length / 1024} KB WAV. Starting Whisper...");

            // Calculate this chunk's duration from WAV size: PCM at 16 kHz, 16-bit, mono = 2 bytes/sample
            var pcmBytes = Math.Max(0, wavBytes.Length - 44);
            var chunkDurationMs = (long)(pcmBytes / 2.0 / 16000.0 * 1000.0);

            var rawSegments = await TranscribeWavAsync(wavBytes, ct);
            Log.Info($"Session {sessionId}: Whisper done, {rawSegments.Count} segments, chunk duration {chunkDurationMs} ms.");

            // Apply timestamp offset so segments have absolute positions in the session
            var segments = rawSegments
                .Select(s => new TranscriptSegment
                {
                    StartMs = s.StartMs + offsetMs,
                    EndMs = s.EndMs + offsetMs,
                    Text = s.Text
                })
                .ToList();

            _sessions[sessionId] = new SessionState(webmHeader, accumulatedMs + chunkDurationMs);

            return segments;
        }
        finally
        {
            semaphore.Release();
        }
    }

    public Task CleanupSessionAsync(Guid sessionId, CancellationToken ct)
    {
        _sessions.TryRemove(sessionId, out _);
        if (_sessionLocks.TryRemove(sessionId, out var semaphore))
            semaphore.Dispose();
        Log.Info($"Session {sessionId}: buffer freed.");
        return Task.CompletedTask;
    }

    // Returns the bytes of chunk1 up to (not including) the first Cluster element (ID: 1F 43 B6 75).
    // Prepending these bytes to any subsequent cluster makes a valid standalone WebM for FFmpeg.
    private static byte[] ExtractWebmHeader(byte[] chunk1Bytes)
    {
        ReadOnlySpan<byte> clusterMarker = [0x1F, 0x43, 0xB6, 0x75];
        var span = chunk1Bytes.AsSpan();
        var idx = span.IndexOf(clusterMarker);
        if (idx < 0)
        {
            Log.Warn("Could not locate Cluster element in first WebM chunk — independent chunk decoding will not work.");
            return [];
        }
        return chunk1Bytes[0..idx];
    }

    private static byte[] CombineBytes(byte[] header, byte[] cluster)
    {
        var result = new byte[header.Length + cluster.Length];
        header.CopyTo(result, 0);
        cluster.CopyTo(result, header.Length);
        return result;
    }

    private async Task<byte[]> ConvertWebMToWavAsync(byte[] webmBytes, CancellationToken ct)
    {
        var inputPath = Path.Combine(Path.GetTempPath(), $"whisper_in_{Guid.NewGuid()}.webm");
        var outputPath = Path.Combine(Path.GetTempPath(), $"whisper_out_{Guid.NewGuid()}.wav");
        try
        {
            await File.WriteAllBytesAsync(inputPath, webmBytes, ct);

            var psi = new ProcessStartInfo
            {
                FileName = _settings.FfmpegPath,
                Arguments = $"-y -i \"{inputPath}\" -ar 16000 -ac 1 \"{outputPath}\"",
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(psi)
                ?? throw new InvalidOperationException("Failed to start FFmpeg process.");

            var stderr = await process.StandardError.ReadToEndAsync(ct);
            await process.WaitForExitAsync(ct);

            if (process.ExitCode != 0)
            {
                Log.Error($"FFmpeg exited with code {process.ExitCode}. Stderr: {stderr}");
                throw new InvalidOperationException($"FFmpeg conversion failed (exit code {process.ExitCode}).");
            }

            return await File.ReadAllBytesAsync(outputPath, ct);
        }
        finally
        {
            File.Delete(inputPath);
            File.Delete(outputPath);
        }
    }

    private async Task<List<TranscriptSegment>> TranscribeWavAsync(byte[] wavBytes, CancellationToken ct)
    {
        using var processor = _factory.CreateBuilder()
            .WithLanguage(_settings.Language)
            .Build();

        using var wavStream = new MemoryStream(wavBytes);

        var segments = new List<TranscriptSegment>();
        await foreach (var seg in processor.ProcessAsync(wavStream, ct))
        {
            segments.Add(new TranscriptSegment
            {
                StartMs = (long)seg.Start.TotalMilliseconds,
                EndMs = (long)seg.End.TotalMilliseconds,
                Text = seg.Text.Trim()
            });
        }

        return segments;
    }

    public async ValueTask DisposeAsync()
    {
        _factory.Dispose();
        await ValueTask.CompletedTask;
    }
}
