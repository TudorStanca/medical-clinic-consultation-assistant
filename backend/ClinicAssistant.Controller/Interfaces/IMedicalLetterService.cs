using ClinicAssistant.Domain.DTOs;

namespace ClinicAssistant.Controller.Interfaces;

public interface IMedicalLetterService
{
    Task<MedicalLetterResponseDTO> CreateLetterAsync(MedicalLetterPostDTO dto, string doctorId, CancellationToken ct);
    Task<MedicalLetterResponseDTO> GetByIdAsync(Guid id);
    Task<MedicalLetterResponseDTO> GetBySessionIdAsync(Guid sessionId);
    Task<MedicalLetterResponseDTO> UpdateLetterAsync(Guid id, MedicalLetterPutDTO dto, CancellationToken ct);
}
