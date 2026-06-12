using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Interfaces;

public interface ILetterAttachmentRepository
{
    Task<LetterAttachment> CreateAsync(LetterAttachment attachment);
    Task<LetterAttachment?> GetByIdAsync(Guid id);
    Task<IEnumerable<LetterAttachment>> GetByLetterIdAsync(Guid letterId);
    Task DeleteAsync(Guid id);
}
