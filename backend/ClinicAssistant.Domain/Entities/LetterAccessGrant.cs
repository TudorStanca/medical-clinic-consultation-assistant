namespace ClinicAssistant.Domain.Entities;

public class LetterAccessGrant
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string PatientId { get; set; } = null!;
    public Patient Patient { get; set; } = null!;
    public string GranteeDoctorId { get; set; } = null!;
    public Doctor GranteeDoctor { get; set; } = null!;
    public string SourceDoctorId { get; set; } = null!;
    public Doctor SourceDoctor { get; set; } = null!;
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
}
