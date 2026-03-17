using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Interfaces;

public interface ITranscriptionRepository
{
    Task<TranscriptionSession> CreateSession();
    Task<TranscriptionSession?> GetSession(Guid sessionId);
    Task Save(TranscriptionSession session);
}
