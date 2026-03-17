using Microsoft.AspNetCore.Identity;

namespace ClinicAssistant.Domain.Entities;

public class AppUser : IdentityUser
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
}
