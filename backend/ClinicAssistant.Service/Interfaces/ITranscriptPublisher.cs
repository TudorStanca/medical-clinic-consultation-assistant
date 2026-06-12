using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Interfaces;

public interface ITranscriptPublisher
{
    Task PublishSegmentAsync(Guid sessionId, TranscriptSegment segment, CancellationToken ct);
    Task PublishStatusAsync(Guid sessionId, string status, CancellationToken ct);
}
