using System.Diagnostics;
using ClinicAssistant.Configuration;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Service;
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
    private readonly SemaphoreSlim _semaphore = new(1, 1);

    public WhisperAudioTranscriber(IOptions<WhisperSettings> options, IOptions<FileStorageSettings> fileStorageOptions)
    {
        _settings = options.Value;

        var modelPath = Path.Combine(Directory.GetCurrentDirectory(), fileStorageOptions.Value.ModelsPath, _settings.ModelFileName);

        if (!File.Exists(modelPath))
        {
            Log.Info($"Whisper model not found at {modelPath}. Downloading...");
            Directory.CreateDirectory(Path.GetDirectoryName(modelPath)!);
            DownloadModelAsync(modelPath, _settings.ModelFileName).GetAwaiter().GetResult();
            Log.Info("Whisper model download complete.");
        }

        if (_settings.UseCuda)
        {
            try
            {
                RuntimeOptions.RuntimeLibraryOrder = [RuntimeLibrary.Cuda, RuntimeLibrary.Cpu];
                _factory = WhisperFactory.FromPath(modelPath, new WhisperFactoryOptions { GpuDevice = 0 });
                Log.Info("WhisperFactory initialized with CUDA.");
            }
            catch (Exception ex)
            {
                Log.Warn($"CUDA init failed ({ex.Message}). Falling back to CPU.");
                RuntimeOptions.RuntimeLibraryOrder = [RuntimeLibrary.Cpu];
                _factory = WhisperFactory.FromPath(modelPath);
                Log.Info("WhisperFactory initialized with CPU (fallback).");
            }
        }
        else
        {
            Log.Info("UseCuda=false — initializing CPU runtime.");
            RuntimeOptions.RuntimeLibraryOrder = [RuntimeLibrary.Cpu];
            _factory = WhisperFactory.FromPath(modelPath);
            Log.Info("WhisperFactory initialized with CPU.");
        }
    }

    private static async Task DownloadModelAsync(string modelPath, string modelFileName)
    {
        var stem = Path.GetFileNameWithoutExtension(modelFileName)
            .Replace("ggml-", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("-", string.Empty);

        if (!Enum.TryParse<GgmlType>(stem, ignoreCase: true, out var ggmlType))
        {
            throw new InvalidOperationException($"Cannot determine GgmlType from ModelFileName '{modelFileName}'. Unrecognized model type '{stem}'.");
        }

        using var modelStream = await WhisperGgmlDownloader.Default.GetGgmlModelAsync(ggmlType);
        using var fileStream = File.OpenWrite(modelPath);
        await modelStream.CopyToAsync(fileStream);
    }

    public async Task<IReadOnlyList<TranscriptSegment>> TranscribePcmAsync(byte[] pcmData, CancellationToken ct)
    {
        if (pcmData.Length == 0)
        {
            Log.Warn("TranscribePcm called with empty PCM data — returning empty transcript.");
            return [];
        }

        Log.Info($"Waiting for Whisper semaphore ({pcmData.Length / 1024} KB PCM)...");
        await _semaphore.WaitAsync(ct);
        try
        {
            if (_settings.LogTimings)
            {
                var audioDurationMs = (long)pcmData.Length * 1000 / (2 * 16000);
                Log.Info($"Whisper start: pcm={pcmData.Length / 1024} KB, samples={pcmData.Length / 2}, audioDuration={audioDurationMs} ms");
            }

            var sw = _settings.LogTimings ? Stopwatch.StartNew() : null;

            var wavBytes = WrapPcmInWav(pcmData);
            var segments = await TranscribeWavAsync(wavBytes, ct);

            if (_settings.LogTimings && sw is not null)
            {
                sw.Stop();
                var audioDurationMs = (long)pcmData.Length * 1000 / (2 * 16000);
                var rtf = audioDurationMs > 0 ? (double)sw.ElapsedMilliseconds / audioDurationMs : 0;
                Log.Info($"Whisper end: {sw.ElapsedMilliseconds} ms, segments={segments.Count}, RTF={rtf:F3}");

                var fullTranscript = string.Join(" ", segments.Select(s => s.Text));
                Log.Info($"Whisper transcript: {fullTranscript}");
            }
            else
            {
                Log.Info($"Whisper done, {segments.Count} segment(s).");
            }

            return segments;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private static byte[] WrapPcmInWav(byte[] pcmData, int sampleRate = 16000, short channels = 1, short bitsPerSample = 16)
    {
        int byteRate = sampleRate * channels * (bitsPerSample / 8);
        short blockAlign = (short)(channels * (bitsPerSample / 8));

        using var ms = new MemoryStream(44 + pcmData.Length);
        using var w = new BinaryWriter(ms);

        w.Write("RIFF"u8); w.Write(36 + pcmData.Length);
        w.Write("WAVE"u8); w.Write("fmt "u8); w.Write(16);
        w.Write((short)1); w.Write(channels); w.Write(sampleRate);
        w.Write(byteRate); w.Write(blockAlign); w.Write(bitsPerSample);
        w.Write("data"u8); w.Write(pcmData.Length); w.Write(pcmData);

        return ms.ToArray();
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
        _semaphore.Dispose();
        _factory.Dispose();
        await ValueTask.CompletedTask;
    }
}
