using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.Enums;
using ClinicAssistant.Domain.Exceptions;
using ClinicAssistant.Service.Interfaces;
using log4net;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace ClinicAssistant.Service;

public class UploadedDocumentService(
    IUploadedDocumentRepository documentRepo,
    IUserRepository userRepo,
    IConsultationSessionRepository sessionRepo,
    IOptions<FileStorageSettings> fileStorageOptions) : IUploadedDocumentService
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(UploadedDocumentService));
    private readonly IUploadedDocumentRepository _documentRepo = documentRepo;
    private readonly IUserRepository _userRepo = userRepo;
    private readonly IConsultationSessionRepository _sessionRepo = sessionRepo;
    private readonly FileStorageSettings _fileStorage = fileStorageOptions.Value;

    private static readonly Dictionary<string, string> AllowedExtensionContentTypes = new()
    {
        [".pdf"] = "application/pdf",
        [".txt"] = "text/plain"
    };

    public async Task<UploadedDocumentResponseDTO> UploadAsync(IFormFile file, string patientId,
        string uploadedByUserId, DocumentType documentType, Guid? sessionId)
    {
        _logger.Info($"Uploading document for patient {patientId}");

        ValidateFile(file, _fileStorage.MaxUploadFileSizeBytes);

        var patientTask = await _userRepo.GetPatientByIdAsync(patientId);
        var uploaderTask = await _userRepo.GetUserByIdAsync(uploadedByUserId);

        var errors = new List<string>();
        if (patientTask == null)
        {
            errors.Add($"Patient {patientId} not found.");
        }
        if (uploaderTask == null)
        {
            errors.Add($"User {uploadedByUserId} not found.");
        }
        if (errors.Count > 0)
        {
            throw new EntityValidationException(errors);
        }

        if (sessionId.HasValue)
        {
            var session = await _sessionRepo.GetByIdAsync(sessionId.Value)
                ?? throw new NotFoundException($"Session {sessionId.Value} not found.");
            if (session.Status is SessionStatus.Failed)
            {
                throw new EntityValidationException(["Cannot upload documents to a failed session."]);
            }
        }

        var safeFileName = Path.GetFileName(file.FileName);
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var docId = Guid.NewGuid();
        var uploadDir = Path.Combine(_fileStorage.UploadsPath, patientId);
        Directory.CreateDirectory(uploadDir);
        var filePath = Path.Combine(uploadDir, $"{docId}{extension}");

        await using (var stream = File.Create(filePath))
            await file.CopyToAsync(stream);

        var document = new UploadedDocument
        {
            Id = docId,
            PatientId = patientId,
            UploadedByUserId = uploadedByUserId,
            SessionId = sessionId,
            FilePath = filePath,
            OriginalFileName = safeFileName,
            DocumentType = documentType
        };

        var created = await _documentRepo.CreateAsync(document);

        return new UploadedDocumentResponseDTO(
            created.Id,
            created.PatientId,
            created.SessionId,
            created.OriginalFileName,
            created.UploadedAt,
            created.DocumentType.ToString(),
            created.UploadedByUserId);
    }

    public async Task<IEnumerable<UploadedDocumentResponseDTO>> GetByPatientIdAsync(string patientId)
    {
        _logger.Info($"Getting documents for patient {patientId}");

        _ = await _userRepo.GetPatientByIdAsync(patientId)
            ?? throw new NotFoundException($"Patient {patientId} not found.");

        var docs = await _documentRepo.GetByPatientIdAsync(patientId);

        return docs.Select(d => new UploadedDocumentResponseDTO(
            d.Id, d.PatientId, d.SessionId, d.OriginalFileName,
            d.UploadedAt, d.DocumentType.ToString(), d.UploadedByUserId));
    }

    public async Task<(Stream Stream, string ContentType, string FileName)> GetFileAsync(Guid id, string requestingUserId, bool canViewAny)
    {
        var doc = await _documentRepo.GetByIdAsync(id)
            ?? throw new NotFoundException($"Document {id} not found.");

        if (!canViewAny && doc.PatientId != requestingUserId)
        {
            throw new UnauthorizedException("Nu ești autorizat să accesezi acest document.");
        }

        if (!File.Exists(doc.FilePath))
        {
            throw new NotFoundException($"File for document {id} not found on disk.");
        }

        var ext = Path.GetExtension(doc.FilePath).ToLowerInvariant();
        var contentType = AllowedExtensionContentTypes.GetValueOrDefault(ext, "application/octet-stream");

        var stream = File.OpenRead(doc.FilePath);

        return (stream, contentType, doc.OriginalFileName);
    }

    public async Task DeleteAsync(Guid id, string requestingUserId, bool isAdmin)
    {
        _logger.Info($"Deleting document {id}");

        var doc = await _documentRepo.GetByIdAsync(id)
            ?? throw new NotFoundException($"Document {id} not found.");

        if (!isAdmin && doc.UploadedByUserId != requestingUserId)
        {
            throw new UnauthorizedException("Nu ești autorizat să ștergi acest document.");
        }

        if (File.Exists(doc.FilePath))
        {
            File.Delete(doc.FilePath);
        }

        await _documentRepo.DeleteAsync(id);
    }

    private static void ValidateFile(IFormFile file, long maxFileSizeBytes)
    {
        if (file == null || file.Length == 0)
        {
            throw new EntityValidationException(["No file provided."]);
        }

        if (file.Length > maxFileSizeBytes)
        {
            throw new EntityValidationException([$"File exceeds the maximum allowed size of {maxFileSizeBytes / 1024 / 1024} MB."]);
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensionContentTypes.ContainsKey(extension))
        {
            throw new EntityValidationException([$"File type '{extension}' is not allowed. Allowed: {string.Join(", ", AllowedExtensionContentTypes.Keys)}"]);
        }

        var fileName = Path.GetFileName(file.FileName);
        if (string.IsNullOrWhiteSpace(fileName) || fileName.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
        {
            throw new EntityValidationException(["Invalid file name."]);
        }
    }
}
