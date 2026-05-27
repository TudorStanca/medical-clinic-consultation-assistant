using ClinicAssistant.Domain.DTOs;

namespace ClinicAssistant.Controller.Interfaces;

public interface ILetterAccessGrantService
{
    Task<IEnumerable<LetterAccessGrantResponseDTO>> GetMyGrantsAsync(string patientId);
    Task<LetterAccessGrantResponseDTO> CreateGrantAsync(LetterAccessGrantPostDTO dto, string patientId);
    Task RevokeGrantAsync(Guid grantId, string patientId);
    Task<bool> HasGrantAsync(string patientId, string granteeDoctorId, string sourceDoctorId);
    Task<IEnumerable<DoctorSearchableResponseDTO>> GetSourceDoctorsAsync(string patientId);
}
