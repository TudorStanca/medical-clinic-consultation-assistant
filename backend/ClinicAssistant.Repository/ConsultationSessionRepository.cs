using ClinicAssistant.Domain.Constants;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Service.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClinicAssistant.Repository;

public class ConsultationSessionRepository(AppDbContext context) : IConsultationSessionRepository
{
    private readonly AppDbContext _context = context;

    public async Task<ConsultationSession> CreateAsync(ConsultationSession session)
    {
        _context.ConsultationSessions.Add(session);
        await _context.SaveChangesAsync();

        return session;
    }

    public async Task<ConsultationSession?> GetByIdAsync(Guid id)
    {
        return await _context.ConsultationSessions
            .Include(s => s.Segments)
            .Include(s => s.Doctor)
            .Include(s => s.Patient)
            .Include(s => s.MedicalLetter)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.ConsultationSessions.AnyAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<ConsultationSession>> GetAllByDoctorAsync(string doctorId)
    {
        return await _context.ConsultationSessions
            .Include(s => s.Doctor)
            .Include(s => s.Patient)
            .Include(s => s.MedicalLetter)
            .Where(s => s.DoctorId == doctorId)
            .ToListAsync();
    }

    public async Task<IEnumerable<ConsultationSession>> GetAllByPatientAsync(string patientId)
    {
        return await _context.ConsultationSessions
            .Include(s => s.Doctor)
            .Include(s => s.Patient)
            .Include(s => s.MedicalLetter)
            .Where(s => s.PatientId == patientId)
            .ToListAsync();
    }

    public async Task<IEnumerable<ConsultationSession>> GetAllAsync()
    {
        return await _context.ConsultationSessions
            .Include(s => s.Doctor)
            .Include(s => s.Patient)
            .Include(s => s.MedicalLetter)
            .ToListAsync();
    }

    public async Task<(IEnumerable<ConsultationSession> Items, int Total)> GetPagedForUserAsync(string userId, IEnumerable<string> roles, int page, int pageSize, string? search, string? sortBy, string? sortDir)
    {
        var roleList = roles.ToList();
        var query = _context.ConsultationSessions
            .Include(s => s.Doctor)
            .Include(s => s.Patient)
            .Include(s => s.MedicalLetter)
            .AsQueryable();

        if (roleList.Contains(Roles.Doctor))
        {
            query = query.Where(s => s.DoctorId == userId);
        }
        else if (roleList.Contains(Roles.Patient))
        {
            query = query.Where(s => s.PatientId == userId);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(s =>
                (s.Patient.FirstName + " " + s.Patient.LastName).ToLower().Contains(term) ||
                (s.Doctor.FirstName + " " + s.Doctor.LastName).ToLower().Contains(term));
        }

        var desc = sortDir?.ToLower() == "desc";
        query = sortBy?.ToLower() switch
        {
            "patientfullname" => desc
                ? query.OrderByDescending(s => s.Patient.LastName).ThenByDescending(s => s.Patient.FirstName)
                : query.OrderBy(s => s.Patient.LastName).ThenBy(s => s.Patient.FirstName),
            "status" => desc ? query.OrderByDescending(s => s.Status) : query.OrderBy(s => s.Status),
            _ => desc ? query.OrderByDescending(s => s.CreatedAt) : query.OrderBy(s => s.CreatedAt),
        };

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return (items, total);
    }

    public async Task UpdateAsync(ConsultationSession session)
    {
        if (_context.Entry(session).State == EntityState.Detached)
        {
            _context.ConsultationSessions.Update(session);
        }

        await _context.SaveChangesAsync();
    }

    public async Task AddSegmentsAsync(IEnumerable<TranscriptSegment> segments)
    {
        await _context.TranscriptSegments.AddRangeAsync(segments);
        await _context.SaveChangesAsync();
    }
}
