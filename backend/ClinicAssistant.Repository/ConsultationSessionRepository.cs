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
            .Include(s => s.Patient)
            .Where(s => s.DoctorId == doctorId)
            .ToListAsync();
    }

    public async Task<IEnumerable<ConsultationSession>> GetAllByPatientAsync(string patientId)
    {
        return await _context.ConsultationSessions
            .Include(s => s.Doctor)
            .Where(s => s.PatientId == patientId)
            .ToListAsync();
    }

    public async Task UpdateAsync(ConsultationSession session)
    {
        if (_context.Entry(session).State == EntityState.Detached)
            _context.ConsultationSessions.Update(session);

        await _context.SaveChangesAsync();
    }

    public async Task AddSegmentsAsync(IEnumerable<TranscriptSegment> segments)
    {
        await _context.TranscriptSegments.AddRangeAsync(segments);
        await _context.SaveChangesAsync();
    }
}
