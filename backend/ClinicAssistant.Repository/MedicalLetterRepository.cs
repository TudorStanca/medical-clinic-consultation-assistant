using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Service.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClinicAssistant.Repository;

public class MedicalLetterRepository(AppDbContext context) : IMedicalLetterRepository
{
    private readonly AppDbContext _context = context;

    public async Task<MedicalLetter> CreateAsync(MedicalLetter letter)
    {
        _context.MedicalLetters.Add(letter);
        await _context.SaveChangesAsync();
        return letter;
    }

    public async Task<MedicalLetter?> GetBySessionIdAsync(Guid sessionId)
    {
        return await _context.MedicalLetters
            .Include(l => l.Session).ThenInclude(s => s.Doctor)
            .Include(l => l.Session).ThenInclude(s => s.Patient)
            .FirstOrDefaultAsync(l => l.SessionId == sessionId);
    }

    public async Task<MedicalLetter?> GetByIdAsync(Guid id)
    {
        return await _context.MedicalLetters
            .Include(l => l.Session).ThenInclude(s => s.Doctor)
            .Include(l => l.Session).ThenInclude(s => s.Patient)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task UpdateAsync(MedicalLetter letter)
    {
        if (_context.Entry(letter).State == EntityState.Detached)
            _context.MedicalLetters.Update(letter);

        await _context.SaveChangesAsync();
    }
}
