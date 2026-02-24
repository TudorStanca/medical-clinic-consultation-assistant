using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.Interfaces;
using System.Collections.Concurrent;

namespace ClinicAssistant.Repository;

public class InMemoryTranscriptionRepository : ITranscriptionRepository
{
    private readonly ConcurrentDictionary<Guid, TranscriptionSession> _sessions = [];

    public Task<TranscriptionSession> CreateSession()
    {
        var session = new TranscriptionSession();
        _sessions[session.Id] = session;
        return Task.FromResult(session);
    }

    public Task<TranscriptionSession?> GetSession(Guid sessionId)
    {
        return Task.FromResult(_sessions.TryGetValue(sessionId, out var session) ? session : null);
    }

    public Task Save(TranscriptionSession session)
    {
        _sessions[session.Id] = session;

        return Task.CompletedTask;
    }
}
