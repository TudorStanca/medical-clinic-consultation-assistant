namespace ClinicAssistant.Domain.DTOs;

public record DoctorResponseDTO(
    string Id,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string Specialization,
    string CodParafa);
