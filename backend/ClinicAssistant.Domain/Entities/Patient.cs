using ClinicAssistant.Domain.Enums;

namespace ClinicAssistant.Domain.Entities;

public class Patient : AppUser
{
    public required string IdentityNumber { get; set; }
    public required string Address { get; set; }
    public required DateTime BirthDate { get; set; }
    public required Sex Sex { get; set; }
}
