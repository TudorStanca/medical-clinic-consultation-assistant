using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Interfaces;

public interface IMedicalLetterRepository
{
    Task<MedicalLetter> CreateAsync(MedicalLetter letter);
    Task<MedicalLetter?> GetBySessionIdAsync(Guid sessionId);
    Task<MedicalLetter?> GetByIdAsync(Guid id);
    Task<IEnumerable<MedicalLetter>> GetByDoctorAndPatientAsync(string doctorId, string patientId, Guid? excludeSessionId, CancellationToken ct);
    Task<IEnumerable<MedicalLetter>> GetByIdsAsync(IEnumerable<Guid> ids, string doctorId, string patientId, CancellationToken ct);
    Task UpdateAsync(MedicalLetter letter);
    Task<int> CountByDoctorAsync(string doctorId);
    Task<int> CountGlobalAsync();
    Task<int> CountByPatientAsync(string patientId);
}
