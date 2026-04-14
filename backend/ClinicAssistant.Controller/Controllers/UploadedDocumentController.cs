using System.Security.Claims;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Constants;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Enums;
using log4net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ClinicAssistant.Controller.Controllers;

[ApiController]
[Route("api/Documents")]
public class UploadedDocumentController(IUploadedDocumentService documentService) : ControllerBase
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(UploadedDocumentController));
    private readonly IUploadedDocumentService _documentService = documentService;

    [HttpPost("upload")]
    [Authorize(Roles = $"{Roles.Doctor},{Roles.Admin}")]
    [ProducesResponseType(typeof(UploadedDocumentResponseDTO), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> UploadDocument(
        IFormFile file,
        [FromForm] string patientId,
        [FromForm] string uploadedByUserId,
        [FromForm] DocumentType documentType,
        [FromForm] Guid? sessionId = null)
    {
        _logger.Info($"Received upload request for patient {patientId}");
        var response = await _documentService.UploadAsync(file, patientId, uploadedByUserId, documentType, sessionId);

        return CreatedAtAction(nameof(GetByPatient), new { patientId = response.PatientId }, response);
    }

    [HttpGet("patient/{patientId}")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<UploadedDocumentResponseDTO>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetByPatient(string patientId)
    {
        _logger.Info($"Received request for documents of patient {patientId}");
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!User.IsInRole(Roles.Admin) && !User.IsInRole(Roles.Doctor) && currentUserId != patientId)
        {
            return Forbid();
        }

        var docs = await _documentService.GetByPatientIdAsync(patientId);

        return Ok(docs);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{Roles.Doctor},{Roles.Admin}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> DeleteDocument(Guid id)
    {
        _logger.Info($"Received request to delete document {id}");
        await _documentService.DeleteAsync(id);

        return NoContent();
    }
}
