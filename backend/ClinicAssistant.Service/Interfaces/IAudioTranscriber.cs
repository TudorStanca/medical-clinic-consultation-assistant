using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Interfaces;

public interface IAudioTranscriber
{
    Task<IReadOnlyList<TranscriptSegment>> TranscribeChunkAsync(string audioPath, CancellationToken ct);
}
