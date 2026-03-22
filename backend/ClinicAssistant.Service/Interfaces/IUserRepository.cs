using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Interfaces;

public interface IUserRepository
{
    Task<AppUser?> GetUserByIdAsync(string id);
    Task<Doctor?> GetDoctorByIdAsync(string id);
    Task<Patient?> GetPatientByIdAsync(string id);
    Task<IEnumerable<Doctor>> GetAllDoctorsAsync();
    Task<IEnumerable<Patient>> GetAllPatientsAsync();
    Task<bool> IdentityNumberExistsAsync(string identityNumber);
    Task<(bool Success, IEnumerable<string> Errors)> CreateDoctorAsync(Doctor doctor, string password);
    Task<(bool Success, IEnumerable<string> Errors)> CreatePatientAsync(Patient patient, string password);
    Task<AppUser?> FindByEmailAsync(string email);
    Task<bool> CheckPasswordAsync(AppUser user, string password);
    Task<IEnumerable<string>> GetRolesAsync(AppUser user);
}
