using ClinicAssistant.Domain.DTOs;

namespace ClinicAssistant.Controller.Interfaces;

public interface IDoctorService
{
    Task<DoctorResponseDTO> CreateDoctorAsync(DoctorPostDTO dto);
    Task<DoctorResponseDTO> GetByIdAsync(string id);
    Task<IEnumerable<DoctorResponseDTO>> GetAllAsync();
}
