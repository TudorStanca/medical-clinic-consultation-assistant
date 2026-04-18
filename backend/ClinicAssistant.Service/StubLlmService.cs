using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Service.Interfaces;
using log4net;

namespace ClinicAssistant.Service;

public class StubLlmService : ILlmService
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(StubLlmService));

    public Task<MedicalLetterContentDTO> GenerateLetterAsync(string transcript, string letterType, CancellationToken ct)
    {
        _logger.Info($"[STUB] Generating letter of type '{letterType}' for transcript of length {transcript.Length}.");

        var content = new MedicalLetterContentDTO(
            Antecedente: "Antecedente placeholder — completați cu datele pacientului.",
            Simptome: "Simptome placeholder — completați pe baza consultației.",
            Clinice: "Examen clinic placeholder — completați pe baza examinării.",
            Paraclinice: null,
            Diagnostic: "Diagnostic placeholder.",
            Recomandari: "Recomandări placeholder — completați pe baza consultației.");

        return Task.FromResult(content);
    }
}
