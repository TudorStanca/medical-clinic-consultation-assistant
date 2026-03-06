using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.DTOs;
using log4net;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DiskFile = System.IO.File;

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

    [HttpPost("{sessionId:guid}/chunks")]
    [RequestSizeLimit(200_000_000)]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> UploadChunk(Guid sessionId, IFormFile chunk, CancellationToken ct)
    {
        _logger.Info($"Received chunk upload for sessionId={sessionId}");

        if (chunk == null || chunk.Length == 0)
            return BadRequest("Chunk file is required.");

        var ext = Path.GetExtension(chunk.FileName)?.ToLowerInvariant();
        if (ext != ".webm")
            return BadRequest("Only .webm audio chunks are accepted.");

        var baseDir = Path.Combine(AppContext.BaseDirectory, "App_Data", "audio", sessionId.ToString());
        Directory.CreateDirectory(baseDir);

        var safeFileName = $"{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Guid.NewGuid()}{Path.GetExtension(chunk.FileName)}";
        var filePath = Path.Combine(baseDir, safeFileName);

        _logger.Info($"Saving uploaded chunk. sessionId={sessionId} file={filePath}");

        await using (var fs = DiskFile.Create(filePath))
        {
            await chunk.CopyToAsync(fs, ct);
        }

        await _transcriptionService.ProcessChunkAsync(sessionId, filePath, ct);

        return Ok(new { ok = true });
    }

    [HttpPost("{sessionId:guid}/stop")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> StopSession(Guid sessionId, CancellationToken ct)
    {
        _logger.Info($"Received request to stop sessionId={sessionId}");
        await _transcriptionService.StopSessionAsync(sessionId, ct);

        return Ok(new { ok = true });
    }

    [HttpGet("{sessionId:guid}")]
    [ProducesResponseType(typeof(SessionDetailResponseDTO), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetSession(Guid sessionId)
    {
        _logger.Info($"Received request to get sessionId={sessionId}");
        var s = await _transcriptionService.GetSession(sessionId);

        return Ok(new SessionDetailResponseDTO(s.Id, s.Status.ToString(), s.AudioChunkPaths.Count, s.Segments.Count));
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
