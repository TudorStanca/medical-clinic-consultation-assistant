using ClinicAssistant.Domain.DTOs;

namespace ClinicAssistant.Service.Interfaces;

public interface ILlmService
{
    Task<MedicalLetterContentDTO> GenerateLetterAsync(string transcript, string letterType, IReadOnlyList<string> contextDocuments, CancellationToken ct);
}
