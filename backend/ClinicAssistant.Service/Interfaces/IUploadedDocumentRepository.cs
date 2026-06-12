using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Interfaces;

public interface IUploadedDocumentRepository
{
    Task<UploadedDocument> CreateAsync(UploadedDocument document);
    Task<IEnumerable<UploadedDocument>> GetByPatientIdAsync(string patientId);
    Task<UploadedDocument?> GetByIdAsync(Guid id);
    Task<IEnumerable<UploadedDocument>> GetBySessionIdAsync(Guid sessionId);
    Task DeleteAsync(Guid id);
}
