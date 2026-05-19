using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Service.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClinicAssistant.Repository;

public class LetterAttachmentRepository(AppDbContext context) : ILetterAttachmentRepository
{
    private readonly AppDbContext _context = context;

    public async Task<LetterAttachment> CreateAsync(LetterAttachment attachment)
    {
        _context.LetterAttachments.Add(attachment);
        await _context.SaveChangesAsync();

        return attachment;
    }

    public async Task<LetterAttachment?> GetByIdAsync(Guid id)
    {
        return await _context.LetterAttachments.FindAsync(id);
    }

    public async Task<IEnumerable<LetterAttachment>> GetByLetterIdAsync(Guid letterId)
    {
        return await _context.LetterAttachments
            .Where(a => a.MedicalLetterId == letterId)
            .OrderBy(a => a.UploadedAt)
            .ToListAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var attachment = await _context.LetterAttachments.FindAsync(id);
        if (attachment != null)
        {
            _context.LetterAttachments.Remove(attachment);
            await _context.SaveChangesAsync();
        }
    }
}
