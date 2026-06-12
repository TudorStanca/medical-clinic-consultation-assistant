using ClinicAssistant.Domain.Enums;

namespace ClinicAssistant.Domain.Entities;

public class ConsultationSession
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public required string DoctorId { get; set; }
    public required string PatientId { get; set; }
    public SessionStatus Status { get; private set; } = SessionStatus.Created;
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime? FinishedAt { get; private set; }
    public string? AudioFilePath { get; set; }

    public Doctor Doctor { get; set; } = null!;
    public Patient Patient { get; set; } = null!;

    private readonly List<TranscriptSegment> _segments = [];
    public IReadOnlyList<TranscriptSegment> Segments => _segments;

    public MedicalLetter? MedicalLetter { get; set; }

    public bool PatientTranscriptAccess { get; private set; }

    public void SetPatientTranscriptAccess(bool allow)
    {
        PatientTranscriptAccess = allow;
    }

    public void MarkRecording() => Status = SessionStatus.Recording;
    public void MarkProcessing() => Status = SessionStatus.Processing;

    public void MarkDone()
    {
        Status = SessionStatus.Done;
        FinishedAt = DateTime.UtcNow;
    }

    public void MarkFailed()
    {
        Status = SessionStatus.Failed;
        FinishedAt = DateTime.UtcNow;
    }

    public void MarkInterrupted()
    {
        Status = SessionStatus.Interrupted;
        FinishedAt = DateTime.UtcNow;
    }

    public void AddSegments(IEnumerable<TranscriptSegment> segments) =>
        _segments.AddRange(segments);
}
