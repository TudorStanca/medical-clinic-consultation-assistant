using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.Exceptions;
using ClinicAssistant.Service.Interfaces;
using FluentValidation;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ClinicAssistant.Service;

public class AuthService(IUserRepository userRepository, IOptions<JwtSettings> jwtOptions, IValidator<ChangePasswordRequestDTO> changePasswordValidator, IValidator<ResetPasswordDTO> resetPasswordValidator, IValidator<UpdateProfileRequestDTO> updateProfileValidator) : IAuthService
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly JwtSettings _jwtSettings = jwtOptions.Value;
    private readonly IValidator<ChangePasswordRequestDTO> _changePasswordValidator = changePasswordValidator;
    private readonly IValidator<ResetPasswordDTO> _resetPasswordValidator = resetPasswordValidator;
    private readonly IValidator<UpdateProfileRequestDTO> _updateProfileValidator = updateProfileValidator;

    public async Task<LoginResponseDTO> LoginAsync(LoginRequestDTO dto)
    {
        var user = await _userRepository.FindByEmailAsync(dto.Email)
            ?? throw new UnauthorizedException("Invalid credentials.");

        var passwordValid = await _userRepository.CheckPasswordAsync(user, dto.Password);
        if (!passwordValid)
        {
            throw new UnauthorizedException("Invalid credentials.");
        }

        var roles = await _userRepository.GetRolesAsync(user);
        var tokenString = BuildJwtToken(user, roles);

        return new LoginResponseDTO(tokenString, user.Id, user.Email!, roles);
    }

    public async Task<UpdateProfileResponseDTO> UpdateProfileAsync(string userId, UpdateProfileRequestDTO dto)
    {
        var validationResult = await _updateProfileValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new EntityValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        var (success, errors) = await _userRepository.UpdateProfileAsync(userId, dto.FirstName, dto.LastName, dto.PhoneNumber);
        if (!success)
        {
            throw new EntityValidationException(errors);
        }

        var user = await _userRepository.GetUserByIdAsync(userId)
            ?? throw new NotFoundException($"User {userId} not found.");
        var roles = await _userRepository.GetRolesAsync(user);
        var tokenString = BuildJwtToken(user, roles);

        return new UpdateProfileResponseDTO(tokenString);
    }

    private string BuildJwtToken(AppUser user, IEnumerable<string> roles)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.GivenName, user.FirstName),
            new(ClaimTypes.Surname, user.LastName)
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task ChangePasswordAsync(string userId, ChangePasswordRequestDTO dto)
    {
        var validationResult = await _changePasswordValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new EntityValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        var (success, errors) = await _userRepository.ChangePasswordAsync(userId, dto.CurrentPassword, dto.NewPassword);
        if (!success)
        {
            throw new EntityValidationException(errors);
        }
    }

    public async Task ResetUserPasswordAsync(string targetUserId, ResetPasswordDTO dto)
    {
        var validationResult = await _resetPasswordValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new EntityValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        var targetUser = await _userRepository.GetUserByIdAsync(targetUserId)
            ?? throw new NotFoundException($"User {targetUserId} not found.");

        var roles = await _userRepository.GetRolesAsync(targetUser);
        if (roles.Contains(Domain.Constants.Roles.Admin))
        {
            throw new UnauthorizedException("Cannot reset the password of an Admin account.");
        }

        var (success, errors) = await _userRepository.ResetPasswordAsync(targetUserId, dto.NewPassword);
        if (!success)
        {
            throw new EntityValidationException(errors);
        }
    }
}
