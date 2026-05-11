namespace ClinicAssistant.Domain.DTOs;

public record SessionSummaryResponseDTO(
    Guid SessionId,
    string Status,
    DateTime CreatedAt,
    string DoctorId,
    string DoctorFullName,
    string PatientId,
    string PatientFullName,
    bool HasLetter);
