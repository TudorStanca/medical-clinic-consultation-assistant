namespace ClinicAssistant.Domain.DTOs;

public record UploadedDocumentResponseDTO(
    Guid Id,
    string PatientId,
    Guid? SessionId,
    string OriginalFileName,
    DateTime UploadedAt,
    string DocumentType,
    string UploadedByUserId);
