using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Domain.Interfaces;

public interface IAudioTranscriber
{
    Task<IReadOnlyList<TranscriptSegment>> TranscribeChunkAsync(string audioPath, CancellationToken ct);
}
