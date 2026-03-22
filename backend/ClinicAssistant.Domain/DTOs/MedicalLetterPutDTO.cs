namespace ClinicAssistant.Domain.DTOs;

public record MedicalLetterPutDTO(
    string? Antecedente,
    string? Simptome,
    string? Clinice,
    string? Paraclinice,
    string? Diagnostic,
    string? Recomandari,
    string Location);
