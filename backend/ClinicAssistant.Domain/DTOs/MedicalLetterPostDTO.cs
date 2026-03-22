namespace ClinicAssistant.Domain.DTOs;

public record MedicalLetterPostDTO(
    Guid SessionId,
    string LetterType,
    string Location,
    List<Guid> DocumentIds);
