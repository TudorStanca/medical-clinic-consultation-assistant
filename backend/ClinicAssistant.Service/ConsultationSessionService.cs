using AutoMapper;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Constants;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.Enums;
using ClinicAssistant.Domain.Exceptions;
using ClinicAssistant.Service.Interfaces;
using FluentValidation;
using log4net;
using Microsoft.Extensions.Options;

namespace ClinicAssistant.Service;

public class ConsultationSessionService(
    IConsultationSessionRepository sessionRepo,
    IMedicalLetterRepository letterRepo,
    ITranscriptPublisher publisher,
    IAudioTranscriber transcriber,
    IMapper mapper,
    IValidator<SessionPostDTO> validator,
    IOptions<FileStorageSettings> fileStorageOptions) : IConsultationSessionService
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(ConsultationSessionService));
    private readonly IConsultationSessionRepository _sessionRepo = sessionRepo;
    private readonly IMedicalLetterRepository _letterRepo = letterRepo;
    private readonly ITranscriptPublisher _publisher = publisher;
    private readonly IAudioTranscriber _transcriber = transcriber;
    private readonly IMapper _mapper = mapper;
    private readonly IValidator<SessionPostDTO> _validator = validator;
    private readonly FileStorageSettings _fileStorage = fileStorageOptions.Value;

    public async Task<SessionCreatedResponseDTO> CreateSessionAsync(SessionPostDTO dto, string doctorId)
    {
        _logger.Info($"Creating consultation session for Doctor={doctorId} Patient={dto.PatientId}");

        var result = await _validator.ValidateAsync(dto);
        if (!result.IsValid)
        {
            throw new EntityValidationException(result.Errors.Select(e => e.ErrorMessage));
        }

        if (await _sessionRepo.HasActiveSessionAsync(doctorId))
        {
            throw new ConflictException("Aveți deja o consultație activă. Finalizați-o înainte de a începe alta.");
        }

        var session = new ConsultationSession
        {
            DoctorId = doctorId,
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

    public async Task<PagedResponseDTO<SessionSummaryResponseDTO>> GetSessionsPagedForUserAsync(string userId, IEnumerable<string> roles, PagedQueryDTO query)
    {
        _logger.Info($"Getting paged sessions for user={userId}. Page={query.Page} PageSize={query.PageSize} Search={query.Search}");

        var (items, total) = await _sessionRepo.GetPagedForUserAsync(userId, roles, query.Page, query.PageSize, query.Search, query.SortBy, query.SortDir, query.DateFrom, query.DateTo);

        return new PagedResponseDTO<SessionSummaryResponseDTO>(
            items.Select(s => _mapper.Map<SessionSummaryResponseDTO>(s)),
            total,
            query.Page,
            query.PageSize);
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

            session.MarkDone();
            await _sessionRepo.UpdateAsync(session);

            await _publisher.PublishStatusAsync(sessionId, session.Status.ToString(), ct);

            try
            {
                if (session.AudioFilePath is not null && File.Exists(session.AudioFilePath))
                {
                    File.Delete(session.AudioFilePath);
                    _logger.Info($"Audio file deleted after successful transcription: {session.AudioFilePath}");
                }
            }
            catch (Exception delEx)
            {
                _logger.Warn($"Failed to delete audio file {session.AudioFilePath}: {delEx.Message}");
            }
        }
        catch (Exception ex)
        {
            _logger.Error($"Failed to stop session {sessionId}.", ex);

            session.MarkFailed();
            await _sessionRepo.UpdateAsync(session);
            await _publisher.PublishStatusAsync(sessionId, session.Status.ToString(), ct);

            if (session.AudioFilePath is not null)
            {
                try
                {
                    if (File.Exists(session.AudioFilePath))
                    {
                        File.Delete(session.AudioFilePath);
                        _logger.Info($"Audio file deleted after failed transcription: {session.AudioFilePath}");
                    }
                    session.AudioFilePath = null;
                    await _sessionRepo.UpdateAsync(session);
                }
                catch (Exception delEx)
                {
                    _logger.Warn($"Failed to delete audio file on Failed status: {delEx.Message}");
                }
            }

            throw;
        }
    }

    public async Task DeleteSessionAsync(Guid sessionId, string requestingDoctorId)
    {
        _logger.Info($"Deleting session {sessionId} requested by Doctor={requestingDoctorId}");

        var session = await _sessionRepo.GetByIdAsync(sessionId)
            ?? throw new NotFoundException($"Session {sessionId} not found.");

        if (session.DoctorId != requestingDoctorId)
        {
            throw new UnauthorizedException("Nu aveți permisiunea de a șterge această consultație.");
        }

        if (session.Status != SessionStatus.Interrupted && session.Status != SessionStatus.Failed)
        {
            throw new EntityValidationException([$"Sesiunea nu poate fi ștearsă deoarece are statusul '{session.Status}'."]);
        }

        if (session.AudioFilePath is not null && File.Exists(session.AudioFilePath))
        {
            File.Delete(session.AudioFilePath);
        }

        await _sessionRepo.DeleteAsync(session);
    }

    public async Task SetPatientTranscriptAccessAsync(Guid sessionId, string requestingDoctorId, bool allow)
    {
        _logger.Info($"Setting PatientTranscriptAccess={allow} for session {sessionId} by Doctor={requestingDoctorId}");

        var session = await _sessionRepo.GetByIdAsync(sessionId)
            ?? throw new NotFoundException($"Session {sessionId} not found.");

        if (session.DoctorId != requestingDoctorId)
        {
            throw new UnauthorizedException("Nu aveți permisiunea de a modifica accesul la transcriptul acestei consultații.");
        }

        session.SetPatientTranscriptAccess(allow);
        await _sessionRepo.UpdateAsync(session);
    }

    public async Task<DashboardStatsResponseDTO> GetDashboardStatsAsync(string userId, IEnumerable<string> roles)
    {
        _logger.Info($"Getting dashboard stats for user={userId}");

        var roleList = roles.ToList();

        if (roleList.Contains(Roles.Admin))
        {
            var weekly = await _sessionRepo.CountThisWeekGlobalAsync();
            var letters = await _letterRepo.CountGlobalAsync();
            var avg = await _sessionRepo.GetAverageSessionMinutesGlobalAsync();
            var uniquePatients = await _sessionRepo.CountUniquePatientsGlobalAsync();

            return new DashboardStatsResponseDTO(weekly, letters, avg, uniquePatients);
        }

        if (roleList.Contains(Roles.Patient))
        {
            var weekly = await _sessionRepo.CountThisWeekByPatientAsync(userId);
            var letters = await _letterRepo.CountByPatientAsync(userId);
            var avg = await _sessionRepo.GetAverageSessionMinutesByPatientAsync(userId);
            var uniqueDoctors = await _sessionRepo.CountUniqueDoctorsByPatientAsync(userId);

            return new DashboardStatsResponseDTO(weekly, letters, avg, uniqueDoctors);
        }

        var weeklyDoc = await _sessionRepo.CountByDoctorThisWeekAsync(userId);
        var lettersDoc = await _letterRepo.CountByDoctorAsync(userId);
        var avgDoc = await _sessionRepo.GetAverageSessionMinutesAsync(userId);
        var uniquePatientsDoc = await _sessionRepo.CountUniquePatientsByDoctorAsync(userId);

        return new DashboardStatsResponseDTO(weeklyDoc, lettersDoc, avgDoc, uniquePatientsDoc);
    }

    public async Task UpdateStatusAsync(Guid sessionId, SessionStatus status)
    {
        _logger.Info($"Updating session {sessionId} status to {status}");

        var session = await _sessionRepo.GetByIdAsync(sessionId)
            ?? throw new NotFoundException($"Session {sessionId} not found.");

        switch (status)
        {
            case SessionStatus.Recording: session.MarkRecording(); break;
            case SessionStatus.Processing: session.MarkProcessing(); break;
            case SessionStatus.Done: session.MarkDone(); break;
            case SessionStatus.Failed: session.MarkFailed(); break;
            default:
                throw new EntityValidationException([$"Cannot manually set status to {status}."]);
        }

        await _sessionRepo.UpdateAsync(session);
    }

    public async Task SetAudioFilePathAsync(Guid sessionId, string audioFilePath)
    {
        var session = await _sessionRepo.GetByIdAsync(sessionId)
            ?? throw new NotFoundException($"Session {sessionId} not found.");

        session.AudioFilePath = audioFilePath;
        await _sessionRepo.UpdateAsync(session);
    }

    public async Task<int> CleanupInterruptedAsync(CancellationToken ct = default)
    {
        var sessions = await _sessionRepo.GetActiveSessionsAsync(ct);

        foreach (var session in sessions)
        {
            if (session.AudioFilePath is not null)
            {
                try
                {
                    if (File.Exists(session.AudioFilePath))
                    {
                        File.Delete(session.AudioFilePath);
                        _logger.Info($"Deleted orphaned audio for session {session.Id}: {session.AudioFilePath}");
                    }
                    session.AudioFilePath = null;
                }
                catch (Exception ex)
                {
                    _logger.Warn($"Failed to clean up audio for session {session.Id}: {ex.Message}");
                }
            }
        }

        return await _sessionRepo.MarkActiveAsInterruptedAsync(ct);
    }
}
