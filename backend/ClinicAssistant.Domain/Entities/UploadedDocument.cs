using ClinicAssistant.Domain.Enums;

namespace ClinicAssistant.Domain.Entities;

public class UploadedDocument
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public required string PatientId { get; set; }
    public required string UploadedByUserId { get; set; }
    public Guid? SessionId { get; set; }
    public required string FilePath { get; set; }
    public required string OriginalFileName { get; set; }
    public DateTime UploadedAt { get; init; } = DateTime.UtcNow;
    public DocumentType DocumentType { get; set; }

    public Patient Patient { get; set; } = null!;
    public ConsultationSession? Session { get; set; }
}
