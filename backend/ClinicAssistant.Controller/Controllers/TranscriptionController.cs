using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.DTOs;
using log4net;
using Microsoft.AspNetCore.Mvc;

namespace ClinicAssistant.Controller.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TranscriptionController(ITranscriptionService transcriptionService) : ControllerBase
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(TranscriptionController));

    private readonly ITranscriptionService _transcriptionService = transcriptionService;

    [HttpPost]
    [ProducesResponseType(typeof(SessionCreatedResponseDTO), 201)]
    public async Task<ActionResult> CreateSession()
    {
        _logger.Info("Received request to create transcription session.");
        var session = await _transcriptionService.CreateSession();

        return CreatedAtAction(nameof(GetSession), new { sessionId = session.Id }, new SessionCreatedResponseDTO(session.Id));
    }

    [HttpGet("{sessionId:guid}")]
    [ProducesResponseType(typeof(SessionDetailResponseDTO), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetSession(Guid sessionId)
    {
        _logger.Info($"Received request to get sessionId={sessionId}");
        var s = await _transcriptionService.GetSession(sessionId);

        return Ok(new SessionDetailResponseDTO(s.Id, s.Status.ToString(), s.Segments.Count));
    }

    [HttpGet("{sessionId:guid}/transcript")]
    [ProducesResponseType(typeof(IEnumerable<TranscriptSegmentResponseDTO>), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetTranscript(Guid sessionId)
    {
        _logger.Info($"Received request for transcript of sessionId={sessionId}");
        var s = await _transcriptionService.GetSession(sessionId);

        return Ok(s.Segments.Select(x => new TranscriptSegmentResponseDTO(x.StartMs, x.EndMs, x.Text)));
    }
}
