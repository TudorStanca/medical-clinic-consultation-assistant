using AutoMapper;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.Enums;
using ClinicAssistant.Domain.Exceptions;
using ClinicAssistant.Service.Interfaces;
using FluentValidation;
using log4net;

namespace ClinicAssistant.Service;

public class MedicalLetterService(
    IMedicalLetterRepository letterRepo,
    IConsultationSessionRepository sessionRepo,
    IUploadedDocumentRepository documentRepo,
    ILlmService llmService,
    DocumentTextExtractorResolver extractorResolver,
    IMapper mapper,
    IValidator<MedicalLetterPostDTO> postValidator,
    IValidator<MedicalLetterPutDTO> putValidator) : IMedicalLetterService
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(MedicalLetterService));
    private readonly IMedicalLetterRepository _letterRepo = letterRepo;
    private readonly IConsultationSessionRepository _sessionRepo = sessionRepo;
    private readonly IUploadedDocumentRepository _documentRepo = documentRepo;
    private readonly ILlmService _llmService = llmService;
    private readonly DocumentTextExtractorResolver _extractorResolver = extractorResolver;
    private readonly IMapper _mapper = mapper;
    private readonly IValidator<MedicalLetterPostDTO> _postValidator = postValidator;
    private readonly IValidator<MedicalLetterPutDTO> _putValidator = putValidator;

    public async Task<MedicalLetterResponseDTO> CreateLetterAsync(MedicalLetterPostDTO dto, string doctorId, CancellationToken ct)
    {
        _logger.Info($"Creating medical letter for session={dto.SessionId}, letterType={dto.LetterType}, doctor={doctorId}.");

        var validationResult = await _postValidator.ValidateAsync(dto, ct);
        if (!validationResult.IsValid)
        {
            throw new EntityValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        var session = await _sessionRepo.GetByIdAsync(dto.SessionId)
            ?? throw new NotFoundException($"Session {dto.SessionId} not found.");

        if (session.DoctorId != doctorId)
        {
            throw new UnauthorizedException("You are not authorized to generate a letter for this session.");
        }

        if (session.Status != SessionStatus.Done)
        {
            throw new EntityValidationException(["Sesiunea trebuie să fie finalizată (Done) pentru a genera o scrisoare medicală."]);
        }

        if (session.MedicalLetter != null)
        {
            throw new EntityValidationException(["Există deja o scrisoare medicală pentru această sesiune."]);
        }

        var transcript = string.Join(" ", session.Segments.Select(s => s.Text));

        var sessionDocs = (await _documentRepo.GetBySessionIdAsync(dto.SessionId)).ToList();

        var contextTexts = new List<string>();
        foreach (var doc in sessionDocs)
        {
            var ext = Path.GetExtension(doc.FilePath).ToLowerInvariant();
            var extractor = _extractorResolver.Resolve(ext);
            if (extractor != null)
            {
                var text = await extractor.ExtractTextAsync(doc.FilePath, ct);
                contextTexts.Add(text);
            }
        }

        _logger.Info($"Loaded {sessionDocs.Count} session document(s), extracted text from {contextTexts.Count}.");

        var content = await _llmService.GenerateLetterAsync(transcript, dto.LetterType, contextTexts, ct);

        var letter = new MedicalLetter
        {
            SessionId = dto.SessionId,
            LetterType = dto.LetterType,
            Location = dto.Location,
            Antecedente = content.Antecedente,
            Simptome = content.Simptome,
            Clinice = content.Clinice,
            Paraclinice = content.Paraclinice,
            Diagnostic = content.Diagnostic,
            Recomandari = content.Recomandari
        };

        await _letterRepo.CreateAsync(letter);

        foreach (var doc in sessionDocs)
        {
            letter.AddDocument(doc);
        }

        if (sessionDocs.Count > 0)
        {
            await _letterRepo.UpdateAsync(letter);
        }

        var created = await _letterRepo.GetByIdAsync(letter.Id)
            ?? throw new InvalidOperationException($"Failed to retrieve created letter {letter.Id}.");

        return _mapper.Map<MedicalLetterResponseDTO>(created);
    }

    public async Task<MedicalLetterResponseDTO> GetByIdAsync(Guid id)
    {
        _logger.Info($"Getting medical letter id={id}.");

        var letter = await _letterRepo.GetByIdAsync(id)
            ?? throw new NotFoundException($"Medical letter {id} not found.");

        return _mapper.Map<MedicalLetterResponseDTO>(letter);
    }

    public async Task<MedicalLetterResponseDTO> GetBySessionIdAsync(Guid sessionId)
    {
        _logger.Info($"Getting medical letter for session={sessionId}.");

        var letter = await _letterRepo.GetBySessionIdAsync(sessionId)
            ?? throw new NotFoundException($"Medical letter for session {sessionId} not found.");

        return _mapper.Map<MedicalLetterResponseDTO>(letter);
    }

    public async Task<MedicalLetterResponseDTO> UpdateLetterAsync(Guid id, MedicalLetterPutDTO dto, CancellationToken ct)
    {
        _logger.Info($"Updating medical letter id={id}.");

        var validationResult = await _putValidator.ValidateAsync(dto, ct);
        if (!validationResult.IsValid)
        {
            throw new EntityValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        var letter = await _letterRepo.GetByIdAsync(id)
            ?? throw new NotFoundException($"Medical letter {id} not found.");

        _mapper.Map(dto, letter);
        await _letterRepo.UpdateAsync(letter);

        var updated = await _letterRepo.GetByIdAsync(id)
            ?? throw new InvalidOperationException($"Failed to retrieve updated letter {id}.");

        return _mapper.Map<MedicalLetterResponseDTO>(updated);
    }
}
