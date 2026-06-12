using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace ClinicAssistant.Controller.Interfaces;

public interface IUploadedDocumentService
{
    Task<UploadedDocumentResponseDTO> UploadAsync(IFormFile file, string patientId,
        string uploadedByUserId, DocumentType documentType, Guid? sessionId);
    Task<IEnumerable<UploadedDocumentResponseDTO>> GetByPatientIdAsync(string patientId);
    Task<(Stream Stream, string ContentType, string FileName)> GetFileAsync(Guid id, string requestingUserId, bool canViewAny);
    Task DeleteAsync(Guid id, string requestingUserId, bool isAdmin);
}
