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
    MedicalLetterPdfGenerator pdfGenerator,
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
    private readonly MedicalLetterPdfGenerator _pdfGenerator = pdfGenerator;
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

        var extraDocs = new List<UploadedDocument>();
        if (dto.IncludeAllPatientDocuments)
        {
            var sessionDocIds = sessionDocs.Select(d => d.Id).ToHashSet();
            extraDocs = (await _documentRepo.GetByPatientIdAsync(session.PatientId))
                .Where(d => !sessionDocIds.Contains(d.Id))
                .ToList();
        }

        var contextTexts = new List<string>();
        foreach (var doc in sessionDocs.Concat(extraDocs))
        {
            var ext = Path.GetExtension(doc.FilePath).ToLowerInvariant();
            var extractor = _extractorResolver.Resolve(ext);
            if (extractor != null)
            {
                var text = await extractor.ExtractTextAsync(doc.FilePath, ct);
                contextTexts.Add(text);
            }
        }

        _logger.Info($"Loaded {sessionDocs.Count} session + {extraDocs.Count} patient-wide document(s), extracted text from {contextTexts.Count}.");

        if (dto.PreviousLetterIds?.Count > 0)
        {
            var prevLetters = await _letterRepo.GetByIdsAsync(dto.PreviousLetterIds, doctorId, session.PatientId, ct);

            foreach (var prev in prevLetters)
            {
                var parts = new List<string>
                {
                    $"Scrisoare anterioară ({prev.LetterType}, {prev.WrittenAt:yyyy-MM-dd}):"
                };

                if (!string.IsNullOrWhiteSpace(prev.Antecedente))
                {
                    parts.Add($"Antecedente: {prev.Antecedente}");
                }

                if (!string.IsNullOrWhiteSpace(prev.Simptome))
                {
                    parts.Add($"Simptome: {prev.Simptome}");
                }

                if (!string.IsNullOrWhiteSpace(prev.Clinice))
                {
                    parts.Add($"Examen clinic: {prev.Clinice}");
                }

                if (!string.IsNullOrWhiteSpace(prev.Paraclinice))
                {
                    parts.Add($"Investigații paraclinice: {prev.Paraclinice}");
                }

                if (!string.IsNullOrWhiteSpace(prev.Diagnostic))
                {
                    parts.Add($"Diagnostic: {prev.Diagnostic}");
                }

                if (!string.IsNullOrWhiteSpace(prev.Recomandari))
                {
                    parts.Add($"Recomandări: {prev.Recomandari}");
                }

                contextTexts.Add(string.Join("\n", parts));
            }

            _logger.Info($"Injected {prevLetters.Count()} previous letter(s) into context.");
        }

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

    public async Task<IEnumerable<MedicalLetterSummaryResponseDTO>> GetPreviousLettersAsync(string doctorId, string patientId, Guid? excludeSessionId, CancellationToken ct)
    {
        _logger.Info($"Getting previous letters for doctor={doctorId}, patient={patientId}, excludeSession={excludeSessionId}.");

        var letters = await _letterRepo.GetByDoctorAndPatientAsync(doctorId, patientId, excludeSessionId, ct);

        return letters.Select(l => _mapper.Map<MedicalLetterSummaryResponseDTO>(l));
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

    public async Task<(byte[] Bytes, string FileName)> GetPdfAsync(Guid id)
    {
        _logger.Info($"Generating PDF for medical letter id={id}.");

        var letter = await _letterRepo.GetByIdAsync(id)
            ?? throw new NotFoundException($"Medical letter {id} not found.");

        var attachments = letter.Attachments.Count > 0 ? letter.Attachments : null;
        var bytes = _pdfGenerator.Generate(letter, attachments);
        var fileName = $"scrisoare-medicala-{letter.WrittenAt:yyyyMMdd}-{letter.Id}.pdf";

        return (bytes, fileName);
    }
}
