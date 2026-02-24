using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Domain.Interfaces;

public interface ITranscriptionService
{
    Task<TranscriptionSession> CreateSession();
    Task<TranscriptionSession> GetSession(Guid sessionId);
    Task ProcessChunkAsync(Guid sessionId, string audioPath, CancellationToken ct);
    Task StopSessionAsync(Guid sessionId, CancellationToken ct);
}
