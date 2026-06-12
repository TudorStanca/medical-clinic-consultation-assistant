using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Service.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClinicAssistant.Repository;

public class LetterAccessGrantRepository(AppDbContext context) : ILetterAccessGrantRepository
{
    private readonly AppDbContext _context = context;

    public async Task<IEnumerable<LetterAccessGrant>> GetByPatientAsync(string patientId)
    {
        return await _context.LetterAccessGrants
            .Include(g => g.GranteeDoctor)
            .Include(g => g.SourceDoctor)
            .Where(g => g.PatientId == patientId)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

    public async Task<LetterAccessGrant?> GetByIdAsync(Guid id)
    {
        return await _context.LetterAccessGrants.FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task<bool> ExistsAsync(string patientId, string granteeDoctorId, string sourceDoctorId)
    {
        return await _context.LetterAccessGrants.AnyAsync(g =>
            g.PatientId == patientId
            && g.GranteeDoctorId == granteeDoctorId
            && g.SourceDoctorId == sourceDoctorId);
    }

    public async Task<bool> HasGrantAsync(string patientId, string granteeDoctorId, string sourceDoctorId)
    {
        return await _context.LetterAccessGrants.AnyAsync(g =>
            g.PatientId == patientId
            && g.GranteeDoctorId == granteeDoctorId
            && g.SourceDoctorId == sourceDoctorId);
    }

    public async Task<IEnumerable<Doctor>> GetSourceDoctorsAsync(string patientId)
    {
        var doctorIds = await _context.MedicalLetters
            .Where(l => l.Session.PatientId == patientId)
            .Select(l => l.Session.DoctorId)
            .Distinct()
            .ToListAsync();

        return await _context.Doctors
            .Where(d => doctorIds.Contains(d.Id))
            .OrderBy(d => d.LastName)
            .ToListAsync();
    }

    public async Task<LetterAccessGrant> CreateAsync(LetterAccessGrant grant)
    {
        _context.LetterAccessGrants.Add(grant);
        await _context.SaveChangesAsync();

        return grant;
    }

    public async Task DeleteAsync(Guid id)
    {
        var grant = await _context.LetterAccessGrants.FindAsync(id);
        if (grant is not null)
        {
            _context.LetterAccessGrants.Remove(grant);
            await _context.SaveChangesAsync();
        }
    }
}
