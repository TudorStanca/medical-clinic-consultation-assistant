using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Service.Interfaces;
using log4net;

namespace ClinicAssistant.AudioTranscribers;

public class StubAudioTranscriber : IAudioTranscriber
{
    private static readonly ILog Log = LogManager.GetLogger(typeof(StubAudioTranscriber));

    public Task<IReadOnlyList<TranscriptSegment>> FinalizeSessionAsync(IReadOnlyList<string> audioPaths, CancellationToken ct)
    {
        Log.Info($"[STUB] FinalizeSession: {audioPaths.Count} chunk(s).");

        var segments = audioPaths
            .Select((path, i) => new TranscriptSegment
            {
                StartMs = i * 5000L,
                EndMs = (i + 1) * 5000L,
                Text = $"[stub] chunk {i + 1}: {Path.GetFileName(path)}"
            })
            .ToList();

        return Task.FromResult<IReadOnlyList<TranscriptSegment>>(segments);
    }
}