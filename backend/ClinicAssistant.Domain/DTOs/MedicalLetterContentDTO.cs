namespace ClinicAssistant.Domain.DTOs;

public record MedicalLetterContentDTO(
    string? Antecedente,
    string? Simptome,
    string? Clinice,
    string? Paraclinice,
    string? Diagnostic,
    string? Recomandari);
