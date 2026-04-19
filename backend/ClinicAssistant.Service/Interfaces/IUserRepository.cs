using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Interfaces;

public interface IUserRepository
{
    Task<AppUser?> GetUserByIdAsync(string id);
    Task<Doctor?> GetDoctorByIdAsync(string id);
    Task<Patient?> GetPatientByIdAsync(string id);
    Task<IEnumerable<Doctor>> GetAllDoctorsAsync();
    Task<(IEnumerable<Doctor> Items, int Total)> GetDoctorPagedAsync(int page, int pageSize, string? search, string? sortBy, string? sortDir);
    Task<IEnumerable<Patient>> GetAllPatientsAsync();
    Task<(IEnumerable<Patient> Items, int Total)> GetPatientPagedAsync(int page, int pageSize, string? search, string? sortBy, string? sortDir);
    Task<bool> IdentityNumberExistsAsync(string identityNumber);
    Task<(bool Success, IEnumerable<string> Errors)> CreateDoctorAsync(Doctor doctor, string password);
    Task<(bool Success, IEnumerable<string> Errors)> CreatePatientAsync(Patient patient, string password);
    Task<AppUser?> FindByEmailAsync(string email);
    Task<bool> CheckPasswordAsync(AppUser user, string password);
    Task<IEnumerable<string>> GetRolesAsync(AppUser user);
    Task<(bool Success, IEnumerable<string> Errors)> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
    Task<(bool Success, IEnumerable<string> Errors)> ResetPasswordAsync(string userId, string newPassword);
}
