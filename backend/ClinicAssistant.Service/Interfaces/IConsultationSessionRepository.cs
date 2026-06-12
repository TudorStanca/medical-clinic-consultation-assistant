using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Interfaces;

public interface IConsultationSessionRepository
{
    Task<ConsultationSession> CreateAsync(ConsultationSession session);
    Task<ConsultationSession?> GetByIdAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<IEnumerable<ConsultationSession>> GetAllByDoctorAsync(string doctorId);
    Task<IEnumerable<ConsultationSession>> GetAllByPatientAsync(string patientId);
    Task<IEnumerable<ConsultationSession>> GetAllAsync();
    Task<(IEnumerable<ConsultationSession> Items, int Total)> GetPagedForUserAsync(string userId, IEnumerable<string> roles, int page, int pageSize, string? search, string? sortBy, string? sortDir, DateTime? dateFrom, DateTime? dateTo);
    Task UpdateAsync(ConsultationSession session);
    Task AddSegmentsAsync(IEnumerable<TranscriptSegment> segments);
    Task<bool> HasActiveSessionAsync(string doctorId);
    Task<IReadOnlyList<ConsultationSession>> GetActiveSessionsAsync(CancellationToken ct = default);
    Task<int> MarkActiveAsInterruptedAsync(CancellationToken ct = default);
    Task DeleteAsync(ConsultationSession session);
    Task<int> CountByDoctorAsync(string doctorId);
    Task<int> CountByDoctorThisWeekAsync(string doctorId);
    Task<int> CountUniquePatientsByDoctorAsync(string doctorId);
    Task<int> GetAverageSessionMinutesAsync(string doctorId);
    Task<int> CountThisWeekGlobalAsync();
    Task<int> CountThisWeekByPatientAsync(string patientId);
    Task<int> CountUniquePatientsGlobalAsync();
    Task<int> CountUniqueDoctorsByPatientAsync(string patientId);
    Task<int> GetAverageSessionMinutesGlobalAsync();
    Task<int> GetAverageSessionMinutesByPatientAsync(string patientId);
}
