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
    Task UpdateAsync(ConsultationSession session);
    Task AddSegmentsAsync(IEnumerable<TranscriptSegment> segments);
}
