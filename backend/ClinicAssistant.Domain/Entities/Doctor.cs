namespace ClinicAssistant.Domain.Entities;

public class Doctor : AppUser
{
    public required string Specialization { get; set; }
    public required string CodParafa { get; set; }
}
