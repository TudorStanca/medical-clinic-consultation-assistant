using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Service.Interfaces;
using log4net;

namespace ClinicAssistant.AudioTranscribers;

public class StubAudioTranscriber : IAudioTranscriber
{
    private static readonly ILog Log = LogManager.GetLogger(typeof(StubAudioTranscriber));
    private long _t = 0;

    public Task<IReadOnlyList<TranscriptSegment>> TranscribeChunkAsync(string audioPath, CancellationToken ct)
    {
        Log.Info($"[STUB] Transcribing {audioPath}");

        var start = Interlocked.Add(ref _t, 5000) - 5000;
        var end = start + 5000;

        IReadOnlyList<TranscriptSegment> segs = [
            new TranscriptSegment{
                StartMs = start, 
                EndMs = end, 
                Text = $"[stub] received {Path.GetFileName(audioPath)}"
            }
        ];

        return Task.FromResult(segs);
    }
}