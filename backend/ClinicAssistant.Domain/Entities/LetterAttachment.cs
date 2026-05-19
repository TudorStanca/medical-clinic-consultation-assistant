namespace ClinicAssistant.Domain.Entities;

public class LetterAttachment
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public required Guid MedicalLetterId { get; set; }
    public required string OriginalFileName { get; set; }
    public required string ContentType { get; set; }
    public required byte[] Data { get; set; }
    public string? Caption { get; set; }
    public required string UploadedByUserId { get; set; }
    public DateTime UploadedAt { get; init; } = DateTime.UtcNow;

    public MedicalLetter MedicalLetter { get; set; } = null!;
}
