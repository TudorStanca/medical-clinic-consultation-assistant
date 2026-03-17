using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Controller.Interfaces;

public interface ITranscriptionService
{
    Task<TranscriptionSession> CreateSession();
    Task<TranscriptionSession> GetSession(Guid sessionId);
    Task StopSessionAsync(Guid sessionId, byte[] pcmData, CancellationToken ct);
}
