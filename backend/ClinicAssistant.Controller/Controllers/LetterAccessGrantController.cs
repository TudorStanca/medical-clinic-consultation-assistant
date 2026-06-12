using System.Security.Claims;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Constants;
using ClinicAssistant.Domain.DTOs;
using log4net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicAssistant.Controller.Controllers;

[ApiController]
[Route("api/LetterAccessGrants")]
public class LetterAccessGrantController(ILetterAccessGrantService grantService) : ControllerBase
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(LetterAccessGrantController));
    private readonly ILetterAccessGrantService _grantService = grantService;

    [HttpGet("me")]
    [Authorize(Roles = Roles.Patient)]
    [ProducesResponseType(typeof(IEnumerable<LetterAccessGrantResponseDTO>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    public async Task<ActionResult> GetMyGrants()
    {
        var patientId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        _logger.Info($"Received request to get letter access grants for patient={patientId}.");
        var grants = await _grantService.GetMyGrantsAsync(patientId);

        return Ok(grants);
    }

    [HttpGet("me/source-doctors")]
    [Authorize(Roles = Roles.Patient)]
    [ProducesResponseType(typeof(IEnumerable<DoctorSearchableResponseDTO>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    public async Task<ActionResult> GetSourceDoctors()
    {
        var patientId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        _logger.Info($"Received request to get source doctors for patient={patientId}.");
        var doctors = await _grantService.GetSourceDoctorsAsync(patientId);

        return Ok(doctors);
    }

    [HttpPost]
    [Authorize(Roles = Roles.Patient)]
    [ProducesResponseType(typeof(LetterAccessGrantResponseDTO), 201)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    [ProducesResponseType(409)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> CreateGrant([FromBody] LetterAccessGrantPostDTO dto)
    {
        var patientId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        _logger.Info($"Received request to create letter access grant: patient={patientId}, grantee={dto.GranteeDoctorId}, source={dto.SourceDoctorId}.");
        var grant = await _grantService.CreateGrantAsync(dto, patientId);

        return CreatedAtAction(nameof(GetMyGrants), grant);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Patient)]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> RevokeGrant(Guid id)
    {
        var patientId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        _logger.Info($"Received request to revoke letter access grant id={id} by patient={patientId}.");
        await _grantService.RevokeGrantAsync(id, patientId);

        return NoContent();
    }
}
