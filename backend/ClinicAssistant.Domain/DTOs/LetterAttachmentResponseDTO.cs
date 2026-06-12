namespace ClinicAssistant.Domain.DTOs;

public record LetterAttachmentResponseDTO(
    Guid Id,
    Guid MedicalLetterId,
    string OriginalFileName,
    string ContentType,
    string? Caption,
    string UploadedByUserId,
    DateTime UploadedAt);
