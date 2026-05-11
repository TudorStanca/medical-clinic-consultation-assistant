namespace ClinicAssistant.Domain.DTOs;

public record SessionDetailResponseDTO(
    Guid SessionId,
    string Status,
    int SegmentCount,
    string DoctorId,
    string PatientId,
    string PatientFullName,
    DateTime CreatedAt);
