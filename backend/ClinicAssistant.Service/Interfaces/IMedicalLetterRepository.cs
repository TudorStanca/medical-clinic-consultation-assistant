using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Interfaces;

public interface IMedicalLetterRepository
{
    Task<MedicalLetter> CreateAsync(MedicalLetter letter);
    Task<MedicalLetter?> GetBySessionIdAsync(Guid sessionId);
    Task<MedicalLetter?> GetByIdAsync(Guid id);
    Task UpdateAsync(MedicalLetter letter);
}
