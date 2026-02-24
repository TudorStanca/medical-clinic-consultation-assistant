using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Domain.Interfaces;

public interface ITranscriptionRepository
{
    Task<TranscriptionSession> CreateSession();
    Task<TranscriptionSession?> GetSession(Guid sessionId);
    Task Save(TranscriptionSession session);
}
