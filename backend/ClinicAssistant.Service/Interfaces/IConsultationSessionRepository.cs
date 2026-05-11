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
    Task<(IEnumerable<ConsultationSession> Items, int Total)> GetPagedForUserAsync(string userId, IEnumerable<string> roles, int page, int pageSize, string? search, string? sortBy, string? sortDir);
    Task UpdateAsync(ConsultationSession session);
    Task AddSegmentsAsync(IEnumerable<TranscriptSegment> segments);
    Task<bool> HasActiveSessionAsync(string doctorId);
    Task<int> MarkActiveAsInterruptedAsync(CancellationToken ct = default);
    Task DeleteAsync(ConsultationSession session);
    Task<int> CountByDoctorAsync(string doctorId);
}
