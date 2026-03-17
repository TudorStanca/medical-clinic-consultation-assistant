using ClinicAssistant.Domain.Enums;

namespace ClinicAssistant.Domain.DTOs;

public record PatientResponseDTO(
    string   Id,
    string   FirstName,
    string   LastName,
    string   Email,
    string?  PhoneNumber,
    string   IdentityNumber,
    string   Address,
    DateTime BirthDate,
    Sex      Sex);
