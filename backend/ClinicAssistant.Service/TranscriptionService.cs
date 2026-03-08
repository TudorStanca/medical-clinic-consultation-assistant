using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Entities;
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

    public async Task StopSessionAsync(Guid sessionId, byte[] pcmData, CancellationToken ct)
    {
        var session = await GetSession(sessionId);

        try
        {
            _logger.Info($"Stopping session {sessionId}, transcribing {pcmData.Length / 1024} KB of PCM.");

            session.MarkProcessing();
            await _transcriptionRepo.Save(session);

            var segments = await _transcriber.TranscribePcmAsync(pcmData, ct);

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
