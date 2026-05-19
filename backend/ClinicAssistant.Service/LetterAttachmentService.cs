using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.Exceptions;
using ClinicAssistant.Service.Interfaces;
using log4net;
using Microsoft.AspNetCore.Http;

namespace ClinicAssistant.Service;

public class LetterAttachmentService(
    ILetterAttachmentRepository attachmentRepo,
    IMedicalLetterRepository letterRepo) : ILetterAttachmentService
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(LetterAttachmentService));
    private readonly ILetterAttachmentRepository _attachmentRepo = attachmentRepo;
    private readonly IMedicalLetterRepository _letterRepo = letterRepo;

    private const long MaxImageSizeBytes = 5 * 1024 * 1024; // 5 MB

    private static readonly HashSet<string> AllowedContentTypes =
    [
        "image/png",
        "image/jpeg",
        "image/webp"
    ];

    public async Task<LetterAttachmentResponseDTO> AddAttachmentAsync(Guid letterId, IFormFile file, string? caption, string uploadedByUserId, CancellationToken ct)
    {
        _logger.Info($"Adding attachment to letter {letterId}, file={file.FileName}, size={file.Length}.");

        _ = await _letterRepo.GetByIdAsync(letterId)
            ?? throw new NotFoundException($"Medical letter {letterId} not found.");

        if (file == null || file.Length == 0)
        {
            throw new EntityValidationException(["No file provided."]);
        }

        if (file.Length > MaxImageSizeBytes)
        {
            throw new EntityValidationException([$"Imaginea depășește limita de {MaxImageSizeBytes / 1024 / 1024} MB."]);
        }

        var contentType = file.ContentType?.ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(contentType) || !AllowedContentTypes.Contains(contentType))
        {
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            contentType = ext switch
            {
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".webp" => "image/webp",
                _ => null
            };
        }

        if (contentType == null || !AllowedContentTypes.Contains(contentType))
        {
            throw new EntityValidationException(["Tipul fișierului nu este permis. Sunt acceptate: PNG, JPEG, WEBP."]);
        }

        byte[] data;
        await using (var ms = new MemoryStream())
        {
            await file.CopyToAsync(ms, ct);
            data = ms.ToArray();
        }

        var attachment = new LetterAttachment
        {
            MedicalLetterId = letterId,
            OriginalFileName = Path.GetFileName(file.FileName),
            ContentType = contentType,
            Data = data,
            Caption = caption,
            UploadedByUserId = uploadedByUserId
        };

        var created = await _attachmentRepo.CreateAsync(attachment);

        return ToDto(created);
    }

    public async Task<IEnumerable<LetterAttachmentResponseDTO>> GetByLetterIdAsync(Guid letterId)
    {
        var attachments = await _attachmentRepo.GetByLetterIdAsync(letterId);

        return attachments.Select(ToDto);
    }

    public async Task<(byte[] Data, string ContentType, string FileName)> GetImageAsync(Guid attachmentId)
    {
        var attachment = await _attachmentRepo.GetByIdAsync(attachmentId)
            ?? throw new NotFoundException($"Attachment {attachmentId} not found.");

        return (attachment.Data, attachment.ContentType, attachment.OriginalFileName);
    }

    public async Task DeleteAsync(Guid attachmentId, string requestingUserId)
    {
        _logger.Info($"Deleting attachment {attachmentId} by user {requestingUserId}.");

        var attachment = await _attachmentRepo.GetByIdAsync(attachmentId)
            ?? throw new NotFoundException($"Attachment {attachmentId} not found.");

        if (attachment.UploadedByUserId != requestingUserId)
        {
            throw new UnauthorizedException("Nu ai permisiunea să ștergi această anexă.");
        }

        await _attachmentRepo.DeleteAsync(attachmentId);
    }

    private static LetterAttachmentResponseDTO ToDto(LetterAttachment a) =>
        new(a.Id, a.MedicalLetterId, a.OriginalFileName, a.ContentType, a.Caption, a.UploadedByUserId, a.UploadedAt);
}
