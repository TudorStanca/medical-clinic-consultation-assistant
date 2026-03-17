using ClinicAssistant.Domain.DTOs;

namespace ClinicAssistant.Controller.Interfaces;

public interface IPatientService
{
    Task<PatientResponseDTO> CreatePatientAsync(PatientPostDTO dto);
    Task<PatientResponseDTO> GetByIdAsync(string id);
    Task<IEnumerable<PatientResponseDTO>> GetAllAsync();
}
