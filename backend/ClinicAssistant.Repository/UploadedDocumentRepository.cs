using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Service.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClinicAssistant.Repository;

public class UploadedDocumentRepository(AppDbContext context) : IUploadedDocumentRepository
{
    private readonly AppDbContext _context = context;

    public async Task<UploadedDocument> CreateAsync(UploadedDocument document)
    {
        _context.UploadedDocuments.Add(document);
        await _context.SaveChangesAsync();

        return document;
    }

    public async Task<IEnumerable<UploadedDocument>> GetByPatientIdAsync(string patientId)
    {
        return await _context.UploadedDocuments
            .Where(d => d.PatientId == patientId)
            .ToListAsync();
    }

    public async Task<UploadedDocument?> GetByIdAsync(Guid id)
    {
        return await _context.UploadedDocuments.FindAsync(id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var document = await _context.UploadedDocuments.FindAsync(id);
        if (document != null)
        {
            _context.UploadedDocuments.Remove(document);
            await _context.SaveChangesAsync();
        }
    }
}
