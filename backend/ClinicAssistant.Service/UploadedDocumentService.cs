using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.Enums;
using ClinicAssistant.Domain.Exceptions;
using ClinicAssistant.Service.Interfaces;
using log4net;
using Microsoft.AspNetCore.Http;

namespace ClinicAssistant.Service;

public class UploadedDocumentService(
    IUploadedDocumentRepository documentRepo,
    IUserRepository userRepo,
    IConsultationSessionRepository sessionRepo) : IUploadedDocumentService
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(UploadedDocumentService));
    private readonly IUploadedDocumentRepository _documentRepo = documentRepo;
    private readonly IUserRepository _userRepo = userRepo;
    private readonly IConsultationSessionRepository _sessionRepo = sessionRepo;

    private static readonly HashSet<string> AllowedExtensions = [".pdf"];

    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    public async Task<UploadedDocumentResponseDTO> UploadAsync(IFormFile file, string patientId,
        string uploadedByUserId, DocumentType documentType, Guid? sessionId)
    {
        _logger.Info($"Uploading document for patient {patientId}");

        ValidateFile(file);

        _ = await _userRepo.GetPatientByIdAsync(patientId)
            ?? throw new NotFoundException($"Patient {patientId} not found.");

        _ = await _userRepo.GetUserByIdAsync(uploadedByUserId)
            ?? throw new NotFoundException($"User {uploadedByUserId} not found.");

        if (sessionId.HasValue && !await _sessionRepo.ExistsAsync(sessionId.Value))
            throw new NotFoundException($"Session {sessionId.Value} not found.");

        var safeFileName = Path.GetFileName(file.FileName);
        var uploadDir = Path.Combine("App_Data", "uploads", patientId);
        Directory.CreateDirectory(uploadDir);
        var filePath = Path.Combine(uploadDir, $"{Guid.NewGuid()}_{safeFileName}");

        await using (var stream = File.Create(filePath))
            await file.CopyToAsync(stream);

        var document = new UploadedDocument
        {
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

    public async Task DeleteAsync(Guid id)
    {
        _logger.Info($"Deleting document {id}");

        var doc = await _documentRepo.GetByIdAsync(id)
            ?? throw new NotFoundException($"Document {id} not found.");

        if (File.Exists(doc.FilePath))
            File.Delete(doc.FilePath);

        await _documentRepo.DeleteAsync(id);
    }

    private static void ValidateFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new EntityValidationException(["No file provided."]);

        if (file.Length > MaxFileSizeBytes)
            throw new EntityValidationException([$"File exceeds the maximum allowed size of {MaxFileSizeBytes / 1024 / 1024} MB."]);

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
            throw new EntityValidationException([$"File type '{extension}' is not allowed. Allowed: {string.Join(", ", AllowedExtensions)}"]);

        var fileName = Path.GetFileName(file.FileName);
        if (string.IsNullOrWhiteSpace(fileName) || fileName.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
            throw new EntityValidationException(["Invalid file name."]);
    }
}
