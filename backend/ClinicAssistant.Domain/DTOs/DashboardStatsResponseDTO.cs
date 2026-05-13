namespace ClinicAssistant.Domain.DTOs;

public record DashboardStatsResponseDTO(
    int WeeklyConsultationCount,
    int TotalLetterCount,
    int AverageSessionMinutes,
    int UniqueCounterpartCount);
