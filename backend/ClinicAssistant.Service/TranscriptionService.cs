using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.Enums;
using ClinicAssistant.Domain.Exceptions;
using ClinicAssistant.Service.Interfaces;
using log4net;

namespace ClinicAssistant.Service;

public class TranscriptionService(ITranscriptionRepository transcriptionRepo,
        ITranscriptPublisher publisher, IAudioTranscriber transcriber) : ITranscriptionService
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(TranscriptionService));

    private readonly ITranscriptionRepository _transcriptionRepo = transcriptionRepo;
    private readonly ITranscriptPublisher _publisher = publisher;
    private readonly IAudioTranscriber _transcriber = transcriber;

    public async Task<TranscriptionSession> CreateSession()
    {
        var session = await _transcriptionRepo.CreateSession();
        _logger.Info($"Created transcription session {session.Id}");

        return session;
    }

    public async Task<TranscriptionSession> GetSession(Guid sessionId)
    {
        var session = await _transcriptionRepo.GetSession(sessionId);
        if (session == null)
        {
            _logger.Warn($"Session not found: {sessionId}");
            throw new NotFoundException("Session not found.");
        }

        return session;
    }

    public async Task ProcessChunkAsync(Guid sessionId, string audioPath, CancellationToken ct)
    {
        var session = await GetSession(sessionId);

        if (session.Status is SessionStatus.Processing or SessionStatus.Done or SessionStatus.Failed)
        {
            throw new SessionClosedException($"Session {sessionId} is closed and cannot accept new chunks.");
        }

        session.MarkRecording();
        session.AddChunkPath(audioPath);
        await _transcriptionRepo.Save(session);

        _logger.Info($"Chunk saved for session {sessionId}. Path={audioPath}");
    }

    public async Task StopSessionAsync(Guid sessionId, CancellationToken ct)
    {
        var session = await GetSession(sessionId);

        try
        {
            _logger.Info($"Stopping session {sessionId}, transcribing {session.AudioChunkPaths.Count} chunk(s).");

            session.MarkProcessing();
            await _transcriptionRepo.Save(session);

            var segments = await _transcriber.FinalizeSessionAsync(session.AudioChunkPaths, ct);

            session.AddSegments(segments);
            await _transcriptionRepo.Save(session);

            foreach (var seg in segments)
            {
                await _publisher.PublishSegmentAsync(sessionId, seg, ct);
            }

            //TODO: send to llm

            session.MarkDone();
            await _transcriptionRepo.Save(session);

            await _publisher.PublishStatusAsync(sessionId, session.Status.ToString(), ct);
        }
        catch (Exception ex)
        {
            _logger.Error($"Failed to stop session {sessionId}.", ex);

            session.MarkFailed();
            await _transcriptionRepo.Save(session);
            await _publisher.PublishStatusAsync(sessionId, session.Status.ToString(), ct);

            throw;
        }
    }
}
