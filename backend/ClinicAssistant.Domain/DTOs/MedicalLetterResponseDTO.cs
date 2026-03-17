namespace ClinicAssistant.Domain.DTOs;

public record MedicalLetterResponseDTO(
    Guid              Id,
    Guid              SessionId,
    string            LetterType,
    string            Location,
    DateTime          WrittenAt,
    DateTime?         LastEditedAt,
    string?           Antecedente,
    string?           Simptome,
    string?           Clinice,
    string?           Paraclinice,
    string?           Diagnostic,
    string?           Recomandari,
    DoctorResponseDTO  Doctor,
    PatientResponseDTO Patient);
