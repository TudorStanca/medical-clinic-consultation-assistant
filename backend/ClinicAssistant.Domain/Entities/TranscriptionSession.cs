using ClinicAssistant.Domain.Enums;

namespace ClinicAssistant.Domain.Entities;

public class TranscriptionSession
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public SessionStatus Status { get; private set; } = SessionStatus.Created;

    private readonly List<TranscriptSegment> _segments = [];
    public IReadOnlyList<TranscriptSegment> Segments => _segments;

    public void MarkRecording() => Status = SessionStatus.Recording;
    public void MarkProcessing() => Status = SessionStatus.Processing;
    public void MarkDone() => Status = SessionStatus.Done;
    public void MarkFailed() => Status = SessionStatus.Failed;

    public void AddSegments(IEnumerable<TranscriptSegment> segments) => _segments.AddRange(segments);
}
