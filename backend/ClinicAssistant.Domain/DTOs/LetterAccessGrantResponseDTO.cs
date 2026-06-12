namespace ClinicAssistant.Domain.DTOs;

public record LetterAccessGrantResponseDTO(
    Guid Id,
    string GranteeDoctorId,
    string GranteeName,
    string SourceDoctorId,
    string SourceName,
    DateTime CreatedAt);
