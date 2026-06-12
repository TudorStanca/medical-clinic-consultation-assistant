using ClinicAssistant.Domain.DTOs;

namespace ClinicAssistant.Controller.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDTO> LoginAsync(LoginRequestDTO dto);
    Task ChangePasswordAsync(string userId, ChangePasswordRequestDTO dto);
    Task ResetUserPasswordAsync(string targetUserId, ResetPasswordDTO dto);
    Task<UpdateProfileResponseDTO> UpdateProfileAsync(string userId, UpdateProfileRequestDTO dto);
}
