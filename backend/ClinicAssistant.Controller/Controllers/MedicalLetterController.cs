using System.Security.Claims;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Constants;
using ClinicAssistant.Domain.DTOs;
using log4net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ClinicAssistant.Controller.Controllers;

[ApiController]
[Route("api/MedicalLetters")]
public class MedicalLetterController(IMedicalLetterService letterService, ILetterAttachmentService attachmentService, ILetterAccessGrantService grantService) : ControllerBase
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(MedicalLetterController));
    private readonly IMedicalLetterService _letterService = letterService;
    private readonly ILetterAttachmentService _attachmentService = attachmentService;
    private readonly ILetterAccessGrantService _grantService = grantService;

    private async Task<bool> CanAccessLetterAsync(MedicalLetterResponseDTO letter, string currentUserId)
    {
        if (User.IsInRole(Roles.Patient))
        {
            return letter.Patient.Id == currentUserId;
        }

        if (User.IsInRole(Roles.Doctor) && letter.Doctor.Id != currentUserId)
        {
            return await _grantService.HasGrantAsync(letter.Patient.Id, currentUserId, letter.Doctor.Id);
        }

        return true;
    }

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

    [HttpGet("previous")]
    [Authorize(Roles = Roles.Doctor)]
    [ProducesResponseType(typeof(IEnumerable<MedicalLetterSummaryResponseDTO>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    public async Task<ActionResult> GetPreviousLetters([FromQuery] string patientId, [FromQuery] Guid? excludeSessionId, CancellationToken ct)
    {
        _logger.Info($"Received request to get previous letters for patient={patientId}, excludeSession={excludeSessionId}.");
        var doctorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var letters = await _letterService.GetPreviousLettersAsync(doctorId, patientId, excludeSessionId, ct);

        return Ok(letters);
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
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        if (!await CanAccessLetterAsync(letter, currentUserId))
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
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        if (!await CanAccessLetterAsync(letter, currentUserId))
        {
            return Forbid();
        }

        return Ok(letter);
    }

    [HttpGet("{id:guid}/pdf")]
    [Authorize]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetPdf(Guid id)
    {
        _logger.Info($"Received request to download PDF for medical letter id={id}.");
        var letter = await _letterService.GetByIdAsync(id);
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        if (!await CanAccessLetterAsync(letter, currentUserId))
        {
            return Forbid();
        }

        var (bytes, fileName) = await _letterService.GetPdfAsync(id);

        return File(bytes, "application/pdf", fileName);
    }

    [HttpPost("{id:guid}/attachments")]
    [Authorize(Roles = Roles.Doctor)]
    [ProducesResponseType(typeof(LetterAttachmentResponseDTO), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> AddAttachment(Guid id, IFormFile file, [FromForm] string? caption, CancellationToken ct)
    {
        _logger.Info($"Received request to add attachment to letter id={id}.");
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var attachment = await _attachmentService.AddAttachmentAsync(id, file, caption, userId, ct);

        return CreatedAtAction(nameof(GetAttachments), new { id }, attachment);
    }

    [HttpGet("{id:guid}/attachments")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<LetterAttachmentResponseDTO>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetAttachments(Guid id)
    {
        _logger.Info($"Received request for attachments of letter id={id}.");
        var letter = await _letterService.GetByIdAsync(id);
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        if (!await CanAccessLetterAsync(letter, currentUserId))
        {
            return Forbid();
        }

        var attachments = await _attachmentService.GetByLetterIdAsync(id);

        return Ok(attachments);
    }

    [HttpGet("{id:guid}/attachments/{attachmentId:guid}/image")]
    [Authorize]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetAttachmentImage(Guid id, Guid attachmentId)
    {
        _logger.Info($"Received request to serve attachment image {attachmentId}.");
        var letter = await _letterService.GetByIdAsync(id);
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        if (!await CanAccessLetterAsync(letter, currentUserId))
        {
            return Forbid();
        }

        var (data, contentType, fileName) = await _attachmentService.GetImageAsync(id, attachmentId);

        return File(data, contentType, fileName);
    }

    [HttpDelete("{id:guid}/attachments/{attachmentId:guid}")]
    [Authorize(Roles = Roles.Doctor)]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> DeleteAttachment(Guid id, Guid attachmentId)
    {
        _logger.Info($"Received request to delete attachment {attachmentId} from letter {id}.");
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _attachmentService.DeleteAsync(attachmentId, userId);

        return NoContent();
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
        var doctorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var letter = await _letterService.UpdateLetterAsync(id, dto, doctorId, ct);

        return Ok(letter);
    }
}
