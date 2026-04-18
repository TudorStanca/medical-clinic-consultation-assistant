using System.Security.Claims;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Constants;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Enums;
using log4net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicAssistant.Controller.Controllers;

[ApiController]
[Route("api/ConsultationSessions")]
public class ConsultationSessionController(IConsultationSessionService sessionService) : ControllerBase
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(ConsultationSessionController));
    private readonly IConsultationSessionService _sessionService = sessionService;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<SessionSummaryResponseDTO>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult> GetSessions()
    {
        _logger.Info("Received request to get sessions for current user.");
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value);
        var sessions = await _sessionService.GetSessionsForUserAsync(userId, roles);

        return Ok(sessions);
    }

    [HttpPost]
    [Authorize(Roles = Roles.Doctor)]
    [ProducesResponseType(typeof(SessionCreatedResponseDTO), 201)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> CreateSession([FromBody] SessionPostDTO dto)
    {
        _logger.Info($"Received request to create consultation session. Doctor={dto.DoctorId} Patient={dto.PatientId}");
        var response = await _sessionService.CreateSessionAsync(dto);

        return CreatedAtAction(nameof(GetSession), new { sessionId = response.SessionId }, response);
    }

    [HttpGet("{sessionId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(SessionDetailResponseDTO), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetSession(Guid sessionId)
    {
        _logger.Info($"Received request to get session={sessionId}");
        var session = await _sessionService.GetSessionAsync(sessionId);
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (User.IsInRole(Roles.Patient) && session.PatientId != currentUserId)
        {
            return Forbid();
        }

        return Ok(session);
    }

    [HttpGet("{sessionId:guid}/transcript")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<TranscriptSegmentResponseDTO>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetTranscript(Guid sessionId)
    {
        _logger.Info($"Received request for transcript of session={sessionId}");
        var session = await _sessionService.GetSessionAsync(sessionId);
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (User.IsInRole(Roles.Patient) && session.PatientId != currentUserId)
        {
            return Forbid();
        }

        var segments = await _sessionService.GetTranscriptAsync(sessionId);

        return Ok(segments);
    }

    [HttpPatch("{sessionId:guid}/status")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Doctor}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> UpdateStatus(Guid sessionId, [FromBody] SessionStatusPatchDTO dto)
    {
        _logger.Info($"Received request to update session={sessionId} status to {dto.Status}");
        await _sessionService.UpdateStatusAsync(sessionId, dto.Status);

        return NoContent();
    }
}
