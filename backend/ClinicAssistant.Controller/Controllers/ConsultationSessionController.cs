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

    [HttpGet("stats")]
    [Authorize]
    [ProducesResponseType(typeof(DashboardStatsResponseDTO), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult> GetDashboardStats()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value);
        var stats = await _sessionService.GetDashboardStatsAsync(userId, roles);

        return Ok(stats);
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PagedResponseDTO<SessionSummaryResponseDTO>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult> GetSessions([FromQuery] PagedQueryDTO query)
    {
        _logger.Info($"Received request to get sessions. Page={query.Page} Search={query.Search}");
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value);
        var result = await _sessionService.GetSessionsPagedForUserAsync(userId, roles, query);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = Roles.Doctor)]
    [ProducesResponseType(typeof(SessionCreatedResponseDTO), 201)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(409)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> CreateSession([FromBody] SessionPostDTO dto)
    {
        var doctorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        _logger.Info($"Received request to create consultation session. Doctor={doctorId} Patient={dto.PatientId}");
        var response = await _sessionService.CreateSessionAsync(dto, doctorId);

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

        if (User.IsInRole(Roles.Doctor) && session.DoctorId != currentUserId)
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

        if (User.IsInRole(Roles.Doctor) && session.DoctorId != currentUserId)
        {
            return Forbid();
        }

        if (User.IsInRole(Roles.Patient) && !session.PatientTranscriptAccess)
        {
            return Forbid();
        }

        var segments = await _sessionService.GetTranscriptAsync(sessionId);

        return Ok(segments);
    }

    [HttpDelete("{sessionId:guid}")]
    [Authorize(Roles = Roles.Doctor)]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> DeleteSession(Guid sessionId)
    {
        _logger.Info($"Received request to delete session={sessionId}");
        var doctorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _sessionService.DeleteSessionAsync(sessionId, doctorId);

        return NoContent();
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

        if (User.IsInRole(Roles.Doctor))
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var session = await _sessionService.GetSessionAsync(sessionId);
            if (session.DoctorId != currentUserId)
            {
                return Forbid();
            }
        }

        await _sessionService.UpdateStatusAsync(sessionId, dto.Status);

        return NoContent();
    }

    [HttpPatch("{sessionId:guid}/transcript-access")]
    [Authorize(Roles = Roles.Doctor)]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> SetTranscriptAccess(Guid sessionId, [FromBody] SessionTranscriptAccessPatchDTO dto)
    {
        _logger.Info($"Received request to set transcript access={dto.Allow} for session={sessionId}");
        var doctorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _sessionService.SetPatientTranscriptAccessAsync(sessionId, doctorId, dto.Allow);

        return NoContent();
    }
}
