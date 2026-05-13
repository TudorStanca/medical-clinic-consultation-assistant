using ClinicAssistant.Domain.Constants;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.Enums;
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

    public async Task<(IEnumerable<ConsultationSession> Items, int Total)> GetPagedForUserAsync(string userId, IEnumerable<string> roles, int page, int pageSize, string? search, string? sortBy, string? sortDir, DateTime? dateFrom, DateTime? dateTo)
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

        if (dateFrom.HasValue)
        {
            query = query.Where(s => s.CreatedAt >= dateFrom.Value);
        }

        if (dateTo.HasValue)
        {
            query = query.Where(s => s.CreatedAt < dateTo.Value);
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

    public async Task<bool> HasActiveSessionAsync(string doctorId)
    {
        return await _context.ConsultationSessions.AnyAsync(s =>
            s.DoctorId == doctorId &&
            (s.Status == SessionStatus.Recording || s.Status == SessionStatus.Processing));
    }

    public async Task<int> MarkActiveAsInterruptedAsync(CancellationToken ct = default)
    {
        var sessions = await _context.ConsultationSessions
            .Where(s => s.Status == SessionStatus.Recording || s.Status == SessionStatus.Processing)
            .ToListAsync(ct);

        foreach (var session in sessions)
        {
            session.MarkInterrupted();
        }

        await _context.SaveChangesAsync(ct);

        return sessions.Count;
    }

    public async Task DeleteAsync(ConsultationSession session)
    {
        _context.ConsultationSessions.Remove(session);
        await _context.SaveChangesAsync();
    }

    public async Task<int> CountByDoctorAsync(string doctorId)
    {
        return await _context.ConsultationSessions.CountAsync(s => s.DoctorId == doctorId);
    }

    public async Task<int> CountByDoctorThisWeekAsync(string doctorId)
    {
        var today = DateTime.UtcNow.Date;
        var dayOfWeek = (int)today.DayOfWeek;
        var daysFromMonday = dayOfWeek == 0 ? 6 : dayOfWeek - 1;
        var startOfWeek = today.AddDays(-daysFromMonday);

        return await _context.ConsultationSessions
            .CountAsync(s => s.DoctorId == doctorId && s.CreatedAt >= startOfWeek);
    }

    public async Task<int> CountUniquePatientsByDoctorAsync(string doctorId)
    {
        return await _context.ConsultationSessions
            .Where(s => s.DoctorId == doctorId)
            .Select(s => s.PatientId)
            .Distinct()
            .CountAsync();
    }

    public async Task<int> GetAverageSessionMinutesAsync(string doctorId)
    {
        var timestamps = await _context.ConsultationSessions
            .Where(s => s.DoctorId == doctorId && s.Status == SessionStatus.Done && s.FinishedAt.HasValue)
            .Select(s => new { s.CreatedAt, FinishedAt = s.FinishedAt!.Value })
            .ToListAsync();

        if (timestamps.Count == 0)
        {
            return 0;
        }

        return (int)timestamps.Average(s => (s.FinishedAt - s.CreatedAt).TotalMinutes);
    }

    public async Task<int> CountThisWeekGlobalAsync()
    {
        var today = DateTime.UtcNow.Date;
        var dayOfWeek = (int)today.DayOfWeek;
        var daysFromMonday = dayOfWeek == 0 ? 6 : dayOfWeek - 1;
        var startOfWeek = today.AddDays(-daysFromMonday);

        return await _context.ConsultationSessions.CountAsync(s => s.CreatedAt >= startOfWeek);
    }

    public async Task<int> CountThisWeekByPatientAsync(string patientId)
    {
        var today = DateTime.UtcNow.Date;
        var dayOfWeek = (int)today.DayOfWeek;
        var daysFromMonday = dayOfWeek == 0 ? 6 : dayOfWeek - 1;
        var startOfWeek = today.AddDays(-daysFromMonday);

        return await _context.ConsultationSessions
            .CountAsync(s => s.PatientId == patientId && s.CreatedAt >= startOfWeek);
    }

    public async Task<int> CountUniquePatientsGlobalAsync()
    {
        return await _context.ConsultationSessions
            .Select(s => s.PatientId)
            .Distinct()
            .CountAsync();
    }

    public async Task<int> CountUniqueDoctorsByPatientAsync(string patientId)
    {
        return await _context.ConsultationSessions
            .Where(s => s.PatientId == patientId)
            .Select(s => s.DoctorId)
            .Distinct()
            .CountAsync();
    }

    public async Task<int> GetAverageSessionMinutesGlobalAsync()
    {
        var timestamps = await _context.ConsultationSessions
            .Where(s => s.Status == SessionStatus.Done && s.FinishedAt.HasValue)
            .Select(s => new { s.CreatedAt, FinishedAt = s.FinishedAt!.Value })
            .ToListAsync();

        if (timestamps.Count == 0)
        {
            return 0;
        }

        return (int)timestamps.Average(s => (s.FinishedAt - s.CreatedAt).TotalMinutes);
    }

    public async Task<int> GetAverageSessionMinutesByPatientAsync(string patientId)
    {
        var timestamps = await _context.ConsultationSessions
            .Where(s => s.PatientId == patientId && s.Status == SessionStatus.Done && s.FinishedAt.HasValue)
            .Select(s => new { s.CreatedAt, FinishedAt = s.FinishedAt!.Value })
            .ToListAsync();

        if (timestamps.Count == 0)
        {
            return 0;
        }

        return (int)timestamps.Average(s => (s.FinishedAt - s.CreatedAt).TotalMinutes);
    }
}
