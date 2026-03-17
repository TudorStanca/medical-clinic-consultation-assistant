using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace ClinicAssistant.Controller.Interfaces;

public interface IUploadedDocumentService
{
    Task<UploadedDocumentResponseDTO> UploadAsync(IFormFile file, string patientId,
        string uploadedByUserId, DocumentType documentType, Guid? sessionId);
    Task<IEnumerable<UploadedDocumentResponseDTO>> GetByPatientIdAsync(string patientId);
    Task DeleteAsync(Guid id);
}
