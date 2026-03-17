namespace ClinicAssistant.Domain.Entities;

public class MedicalLetter
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid SessionId { get; set; }

    public string? Antecedente { get; set; }
    public string? Simptome { get; set; }
    public string? Clinice { get; set; }
    public string? Paraclinice { get; set; }
    public string? Diagnostic { get; set; }
    public string? Recomandari { get; set; }

    public required string LetterType { get; set; }
    public required string Location { get; set; }
    public DateTime WrittenAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastEditedAt { get; set; }

    public ConsultationSession Session { get; set; } = null!;
}
