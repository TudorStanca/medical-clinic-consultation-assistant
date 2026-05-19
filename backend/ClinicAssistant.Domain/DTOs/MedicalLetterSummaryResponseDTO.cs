namespace ClinicAssistant.Domain.DTOs;

public record MedicalLetterSummaryResponseDTO(
    Guid Id,
    string LetterType,
    string Location,
    DateTime WrittenAt);
