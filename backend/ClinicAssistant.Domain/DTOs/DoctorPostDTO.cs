namespace ClinicAssistant.Domain.DTOs;

public record DoctorPostDTO(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string PhoneNumber,
    string Specialization,
    string CodParafa);
