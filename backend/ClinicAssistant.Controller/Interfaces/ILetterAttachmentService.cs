using ClinicAssistant.Domain.DTOs;
using Microsoft.AspNetCore.Http;

namespace ClinicAssistant.Controller.Interfaces;

public interface ILetterAttachmentService
{
    Task<LetterAttachmentResponseDTO> AddAttachmentAsync(Guid letterId, IFormFile file, string? caption, string uploadedByUserId, CancellationToken ct);
    Task<IEnumerable<LetterAttachmentResponseDTO>> GetByLetterIdAsync(Guid letterId);
    Task<(byte[] Data, string ContentType, string FileName)> GetImageAsync(Guid attachmentId);
    Task DeleteAsync(Guid attachmentId, string requestingUserId);
}
