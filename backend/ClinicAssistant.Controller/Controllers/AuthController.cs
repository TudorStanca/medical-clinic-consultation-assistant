using System.Security.Claims;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.DTOs;
using log4net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicAssistant.Controller.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(AuthController));
    private readonly IAuthService _authService = authService;

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponseDTO), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult> Login([FromBody] LoginRequestDTO dto)
    {
        _logger.Info($"Received login request for: {dto.Email}");
        var response = await _authService.LoginAsync(dto);

        return Ok(response);
    }

    [HttpPut("change-password")]
    [Authorize]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequestDTO dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        _logger.Info($"Received change-password request for user: {userId}");
        await _authService.ChangePasswordAsync(userId, dto);

        return NoContent();
    }

    [HttpPut("users/{targetUserId}/reset-password")]
    [Authorize(Roles = Domain.Constants.Roles.Admin)]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> ResetUserPassword(string targetUserId, [FromBody] ResetPasswordDTO dto)
    {
        _logger.Info($"Admin reset password request for user: {targetUserId}");
        await _authService.ResetUserPasswordAsync(targetUserId, dto);

        return NoContent();
    }
}
