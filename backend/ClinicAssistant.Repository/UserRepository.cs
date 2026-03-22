using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Service.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ClinicAssistant.Repository;

public class UserRepository(AppDbContext context, UserManager<AppUser> userManager) : IUserRepository
{
    private readonly AppDbContext _context = context;
    private readonly UserManager<AppUser> _userManager = userManager;

    public async Task<AppUser?> GetUserByIdAsync(string id)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<Doctor?> GetDoctorByIdAsync(string id)
    {
        return await _context.Doctors.FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Patient?> GetPatientByIdAsync(string id)
    {
        return await _context.Patients.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Doctor>> GetAllDoctorsAsync()
    {
        return await _context.Doctors.ToListAsync();
    }

    public async Task<IEnumerable<Patient>> GetAllPatientsAsync()
    {
        return await _context.Patients.ToListAsync();
    }

    public async Task<bool> IdentityNumberExistsAsync(string identityNumber)
    {
        return await _context.Patients.AnyAsync(p => p.IdentityNumber == identityNumber);
    }

    public async Task<(bool Success, IEnumerable<string> Errors)> CreateDoctorAsync(Doctor doctor, string password)
    {
        var result = await _userManager.CreateAsync(doctor, password);
        return (result.Succeeded, result.Errors.Select(e => e.Description));
    }

    public async Task<(bool Success, IEnumerable<string> Errors)> CreatePatientAsync(Patient patient, string password)
    {
        var result = await _userManager.CreateAsync(patient, password);
        return (result.Succeeded, result.Errors.Select(e => e.Description));
    }
}
