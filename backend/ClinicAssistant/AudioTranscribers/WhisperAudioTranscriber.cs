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
    }

    private static async Task DownloadModelAsync(string modelPath)
    {
        using var modelStream = await WhisperGgmlDownloader.Default.GetGgmlModelAsync(GgmlType.Medium);
        using var fileStream = File.OpenWrite(modelPath);
        await modelStream.CopyToAsync(fileStream);
    }

    public async Task<IReadOnlyList<TranscriptSegment>> FinalizeSessionAsync(
        IReadOnlyList<string> audioPaths, CancellationToken ct)
    {
        if (audioPaths.Count == 0)
        {
            Log.Warn("FinalizeSession called with no audio chunks — returning empty transcript.");

            return [];
        }

        Log.Info($"Finalizing session: concatenating {audioPaths.Count} chunk(s) for transcription.");

        var sortedPaths = audioPaths.OrderBy(p => p).ToList();
        var totalBytes = await ConcatenateFilesAsync(sortedPaths, ct);

        Log.Info($"FFmpeg converting {totalBytes.Length / 1024} KB of WebM audio...");
        var wavBytes = await ConvertWebMToWavAsync(totalBytes, ct);

        Log.Info($"FFmpeg done, {wavBytes.Length / 1024} KB WAV. Starting Whisper...");
        var segments = await TranscribeWavAsync(wavBytes, ct);

        Log.Info($"Whisper done, {segments.Count} segment(s).");

        return segments;
    }

    private static async Task<byte[]> ConcatenateFilesAsync(IReadOnlyList<string> paths, CancellationToken ct)
    {
        using var ms = new MemoryStream();
        foreach (var path in paths)
        {
            var bytes = await File.ReadAllBytesAsync(path, ct);
            await ms.WriteAsync(bytes, ct);
        }
        return ms.ToArray();
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
