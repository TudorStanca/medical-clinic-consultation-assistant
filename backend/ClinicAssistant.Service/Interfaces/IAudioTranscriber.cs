using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Interfaces;

public interface IAudioTranscriber
{
    Task<IReadOnlyList<TranscriptSegment>> TranscribePcmAsync(byte[] pcmData, CancellationToken ct);
}
