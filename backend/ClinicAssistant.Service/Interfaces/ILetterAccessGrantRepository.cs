using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Interfaces;

public interface ILetterAccessGrantRepository
{
    Task<IEnumerable<LetterAccessGrant>> GetByPatientAsync(string patientId);
    Task<LetterAccessGrant?> GetByIdAsync(Guid id);
    Task<bool> ExistsAsync(string patientId, string granteeDoctorId, string sourceDoctorId);
    Task<bool> HasGrantAsync(string patientId, string granteeDoctorId, string sourceDoctorId);
    Task<IEnumerable<Doctor>> GetSourceDoctorsAsync(string patientId);
    Task<LetterAccessGrant> CreateAsync(LetterAccessGrant grant);
    Task DeleteAsync(Guid id);
}
