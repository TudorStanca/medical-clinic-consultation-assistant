using System.Security.Claims;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Constants;
using ClinicAssistant.Domain.DTOs;
using log4net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicAssistant.Controller.Controllers;

[ApiController]
[Route("api/MedicalLetters")]
public class MedicalLetterController(IMedicalLetterService letterService) : ControllerBase
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(MedicalLetterController));
    private readonly IMedicalLetterService _letterService = letterService;

    [HttpPost]
    [Authorize(Roles = Roles.Doctor)]
    [ProducesResponseType(typeof(MedicalLetterResponseDTO), 201)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> CreateLetter([FromBody] MedicalLetterPostDTO dto, CancellationToken ct)
    {
        _logger.Info($"Received request to create medical letter for session={dto.SessionId}.");
        var doctorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var letter = await _letterService.CreateLetterAsync(dto, doctorId, ct);

        return CreatedAtAction(nameof(GetLetter), new { id = letter.Id }, letter);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(MedicalLetterResponseDTO), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetLetter(Guid id)
    {
        _logger.Info($"Received request to get medical letter id={id}.");
        var letter = await _letterService.GetByIdAsync(id);
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (User.IsInRole(Roles.Patient) && letter.Patient.Id != currentUserId)
        {
            return Forbid();
        }

        return Ok(letter);
    }

    [HttpGet("session/{sessionId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(MedicalLetterResponseDTO), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetLetterBySession(Guid sessionId)
    {
        _logger.Info($"Received request to get medical letter for session={sessionId}.");
        var letter = await _letterService.GetBySessionIdAsync(sessionId);
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (User.IsInRole(Roles.Patient) && letter.Patient.Id != currentUserId)
        {
            return Forbid();
        }

        return Ok(letter);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.Doctor)]
    [ProducesResponseType(typeof(MedicalLetterResponseDTO), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> UpdateLetter(Guid id, [FromBody] MedicalLetterPutDTO dto, CancellationToken ct)
    {
        _logger.Info($"Received request to update medical letter id={id}.");
        var letter = await _letterService.UpdateLetterAsync(id, dto, ct);

        return Ok(letter);
    }
}
