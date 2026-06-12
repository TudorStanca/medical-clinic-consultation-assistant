using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Service.Interfaces;
using log4net;

namespace ClinicAssistant.AudioTranscribers;

public class StubAudioTranscriber : IAudioTranscriber
{
    private static readonly ILog Log = LogManager.GetLogger(typeof(StubAudioTranscriber));

    public Task<IReadOnlyList<TranscriptSegment>> TranscribePcmAsync(byte[] pcmData, CancellationToken ct)
    {
        Log.Info($"[STUB] TranscribePcm: {pcmData.Length / 1024} KB of PCM.");

        IReadOnlyList<TranscriptSegment> segments =
        [
            new TranscriptSegment
            {
                StartMs = 0,
                EndMs = 5000,
                Text = "[stub] transcribed PCM audio"
            }
        ];

        return Task.FromResult(segments);
    }
}
