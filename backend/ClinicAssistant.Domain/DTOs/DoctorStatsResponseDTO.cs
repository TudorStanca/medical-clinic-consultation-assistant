namespace ClinicAssistant.Domain.DTOs;

public record DoctorStatsResponseDTO(
    int ConsultationCount,
    int MedicalLetterCount,
    int WeeklyConsultationCount,
    int UniquePatientCount,
    int AverageSessionMinutes);
