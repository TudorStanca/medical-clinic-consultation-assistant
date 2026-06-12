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
            .Include(l => l.Documents)
            .FirstOrDefaultAsync(l => l.SessionId == sessionId);
    }

    public async Task<MedicalLetter?> GetByIdAsync(Guid id)
    {
        return await _context.MedicalLetters
            .Include(l => l.Session).ThenInclude(s => s.Doctor)
            .Include(l => l.Session).ThenInclude(s => s.Patient)
            .Include(l => l.Documents)
            .Include(l => l.Attachments)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task UpdateAsync(MedicalLetter letter)
    {
        if (_context.Entry(letter).State == EntityState.Detached)
        {
            _context.MedicalLetters.Update(letter);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<MedicalLetter>> GetByDoctorAndPatientAsync(string doctorId, string patientId, Guid? excludeSessionId, CancellationToken ct)
    {
        return await _context.MedicalLetters
            .Include(l => l.Session).ThenInclude(s => s.Doctor)
            .Where(l => l.Session.PatientId == patientId
                && (excludeSessionId == null || l.SessionId != excludeSessionId)
                && (l.Session.DoctorId == doctorId
                    || _context.LetterAccessGrants.Any(g =>
                        g.PatientId == patientId
                        && g.GranteeDoctorId == doctorId
                        && g.SourceDoctorId == l.Session.DoctorId)))
            .OrderByDescending(l => l.WrittenAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<MedicalLetter>> GetByIdsAsync(IEnumerable<Guid> ids, string doctorId, string patientId, CancellationToken ct)
    {
        var idSet = ids.ToHashSet();

        return await _context.MedicalLetters
            .Include(l => l.Session)
            .Where(l => idSet.Contains(l.Id)
                && l.Session.PatientId == patientId
                && (l.Session.DoctorId == doctorId
                    || _context.LetterAccessGrants.Any(g =>
                        g.PatientId == patientId
                        && g.GranteeDoctorId == doctorId
                        && g.SourceDoctorId == l.Session.DoctorId)))
            .OrderBy(l => l.WrittenAt)
            .ToListAsync(ct);
    }

    public async Task<int> CountByDoctorAsync(string doctorId)
    {
        return await _context.MedicalLetters.CountAsync(l => l.Session.DoctorId == doctorId);
    }

    public async Task<int> CountGlobalAsync()
    {
        return await _context.MedicalLetters.CountAsync();
    }

    public async Task<int> CountByPatientAsync(string patientId)
    {
        return await _context.MedicalLetters.CountAsync(l => l.Session.PatientId == patientId);
    }
}
