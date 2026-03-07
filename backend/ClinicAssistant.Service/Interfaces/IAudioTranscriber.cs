using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Interfaces;

public interface IAudioTranscriber
{
    Task<IReadOnlyList<TranscriptSegment>> TranscribeChunkAsync(Guid sessionId, string audioPath, CancellationToken ct);
    Task CleanupSessionAsync(Guid sessionId, CancellationToken ct);
}
