using AutoMapper;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.Exceptions;
using ClinicAssistant.Service.Interfaces;
using FluentValidation;
using log4net;

namespace ClinicAssistant.Service;

public class ConsultationSessionService(
    IConsultationSessionRepository sessionRepo,
    IUserRepository userRepo,
    ITranscriptPublisher publisher,
    IAudioTranscriber transcriber,
    IMapper mapper,
    IValidator<SessionPostDTO> validator) : IConsultationSessionService
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(ConsultationSessionService));
    private readonly IConsultationSessionRepository _sessionRepo = sessionRepo;
    private readonly IUserRepository _userRepo = userRepo;
    private readonly ITranscriptPublisher _publisher = publisher;
    private readonly IAudioTranscriber _transcriber = transcriber;
    private readonly IMapper _mapper = mapper;
    private readonly IValidator<SessionPostDTO> _validator = validator;

    public async Task<SessionCreatedResponseDTO> CreateSessionAsync(SessionPostDTO dto)
    {
        _logger.Info($"Creating consultation session for Doctor={dto.DoctorId} Patient={dto.PatientId}");

        var result = await _validator.ValidateAsync(dto);
        if (!result.IsValid)
            throw new EntityValidationException(result.Errors.Select(e => e.ErrorMessage));

        _ = await _userRepo.GetDoctorByIdAsync(dto.DoctorId)
            ?? throw new NotFoundException($"Doctor {dto.DoctorId} not found.");

        _ = await _userRepo.GetPatientByIdAsync(dto.PatientId)
            ?? throw new NotFoundException($"Patient {dto.PatientId} not found.");

        var session = new ConsultationSession
        {
            DoctorId = dto.DoctorId,
            PatientId = dto.PatientId
        };

        await _sessionRepo.CreateAsync(session);
        return new SessionCreatedResponseDTO(session.Id);
    }

    public async Task<SessionDetailResponseDTO> GetSessionAsync(Guid sessionId)
    {
        var session = await _sessionRepo.GetByIdAsync(sessionId)
            ?? throw new NotFoundException($"Session {sessionId} not found.");

        return _mapper.Map<SessionDetailResponseDTO>(session);
    }

    public async Task<IEnumerable<TranscriptSegmentResponseDTO>> GetTranscriptAsync(Guid sessionId)
    {
        var session = await _sessionRepo.GetByIdAsync(sessionId)
            ?? throw new NotFoundException($"Session {sessionId} not found.");

        return session.Segments.Select(s => _mapper.Map<TranscriptSegmentResponseDTO>(s));
    }

    public async Task StopSessionAsync(Guid sessionId, byte[] pcmData, CancellationToken ct)
    {
        var session = await _sessionRepo.GetByIdAsync(sessionId)
            ?? throw new NotFoundException($"Session {sessionId} not found.");

        try
        {
            _logger.Info($"Stopping session {sessionId}, transcribing {pcmData.Length / 1024} KB of PCM.");

            var audioDir = Path.Combine("App_Data", "audio");
            Directory.CreateDirectory(audioDir);
            var audioPath = Path.Combine(audioDir, $"{sessionId}.pcm");
            await File.WriteAllBytesAsync(audioPath, pcmData, ct);
            session.AudioFilePath = audioPath;

            session.MarkProcessing();
            await _sessionRepo.UpdateAsync(session);

            var segments = await _transcriber.TranscribePcmAsync(pcmData, ct);

            var segmentEntities = segments.Select(s => new TranscriptSegment
            {
                StartMs = s.StartMs,
                EndMs = s.EndMs,
                Text = s.Text,
                SessionId = sessionId
            }).ToList();

            await _sessionRepo.AddSegmentsAsync(segmentEntities);

            foreach (var seg in segmentEntities)
                await _publisher.PublishSegmentAsync(sessionId, seg, ct);

            session.MarkDone();
            await _sessionRepo.UpdateAsync(session);

            await _publisher.PublishStatusAsync(sessionId, session.Status.ToString(), ct);
        }
        catch (Exception ex)
        {
            _logger.Error($"Failed to stop session {sessionId}.", ex);

            session.MarkFailed();
            await _sessionRepo.UpdateAsync(session);
            await _publisher.PublishStatusAsync(sessionId, session.Status.ToString(), ct);

            throw;
        }
    }
}
