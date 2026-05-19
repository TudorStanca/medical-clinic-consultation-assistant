namespace ClinicAssistant.Domain.DTOs;

public record MedicalLetterPostDTO(
    Guid SessionId,
    string LetterType,
    string Location,
    bool IncludeAllPatientDocuments = false,
    IReadOnlyList<Guid>? PreviousLetterIds = null);
