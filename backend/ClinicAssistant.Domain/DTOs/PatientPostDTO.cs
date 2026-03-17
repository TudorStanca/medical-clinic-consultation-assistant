using ClinicAssistant.Domain.Enums;

namespace ClinicAssistant.Domain.DTOs;

public record PatientPostDTO(
    string   FirstName,
    string   LastName,
    string   Email,
    string   Password,
    string   PhoneNumber,
    string   IdentityNumber,
    string   Address,
    DateTime BirthDate,
    Sex      Sex);
