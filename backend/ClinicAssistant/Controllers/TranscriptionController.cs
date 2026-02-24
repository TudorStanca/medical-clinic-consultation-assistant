using ClinicAssistant.Domain.Interfaces;
using log4net;
using Microsoft.AspNetCore.Mvc;
using DiskFile = System.IO.File;

namespace ClinicAssistant.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TranscriptionController(ITranscriptionService transcriptionService) : ControllerBase
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(TranscriptionController));

    private readonly ITranscriptionService _transcriptionService = transcriptionService;

    [HttpPost]
    public async Task<ActionResult> CreateSession()
    {
        var session = await _transcriptionService.CreateSession();

        return CreatedAtAction(nameof(GetSession), new { sessionId = session.Id }, session);
    }

    [HttpPost("{sessionId:guid}/chunks")]
    [RequestSizeLimit(200_000_000)]
    public async Task<IActionResult> UploadChunk(Guid sessionId, IFormFile chunk, CancellationToken ct)
    {
        if (chunk == null || chunk.Length == 0)
            return BadRequest("Chunk file is required.");

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

    [HttpGet("{sessionId:guid}")]
    public async Task<ActionResult> GetSession(Guid sessionId)
    {
        var s = await _transcriptionService.GetSession(sessionId);

        return Ok(new
        {
            sessionId = s.Id,
            status = s.Status.ToString(),
            chunks = s.AudioChunkPaths.Count,
            segments = s.Segments.Count
        });
    }

    [HttpGet("{sessionId:guid}/transcript")]
    public async Task<ActionResult> GetTranscript(Guid sessionId)
    {
        var s = await _transcriptionService.GetSession(sessionId);
        return Ok(s.Segments.Select(x => new
        {
            x.StartMs,
            x.EndMs,
            x.Text
        }));
    }
}
