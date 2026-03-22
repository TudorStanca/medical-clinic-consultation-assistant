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
}
