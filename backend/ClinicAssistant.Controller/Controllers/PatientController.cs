using System.Security.Claims;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Constants;
using ClinicAssistant.Domain.DTOs;
using log4net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicAssistant.Controller.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientController(IPatientService patientService) : ControllerBase
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(PatientController));
    private readonly IPatientService _patientService = patientService;

    [HttpPost]
    [Authorize(Roles = $"{Roles.Doctor},{Roles.Admin}")]
    [ProducesResponseType(typeof(PatientResponseDTO), 201)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> CreatePatient([FromBody] PatientPostDTO dto)
    {
        _logger.Info($"Received request to create patient: {dto.Email}");
        var patient = await _patientService.CreatePatientAsync(dto);

        return CreatedAtAction(nameof(GetPatient), new { id = patient.Id }, patient);
    }

    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(PatientResponseDTO), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetPatient(string id)
    {
        _logger.Info($"Received request to get patient: {id}");
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!User.IsInRole(Roles.Admin) && !User.IsInRole(Roles.Doctor) && currentUserId != id)
        {
            return Forbid();
        }

        var patient = await _patientService.GetByIdAsync(id);

        return Ok(patient);
    }

    [HttpGet]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Doctor}")]
    [ProducesResponseType(typeof(PagedResponseDTO<PatientResponseDTO>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    public async Task<ActionResult> GetAllPatients([FromQuery] PagedQueryDTO query)
    {
        _logger.Info($"Received request to get patients. Page={query.Page} Search={query.Search}");
        var result = await _patientService.GetPagedAsync(query);

        return Ok(result);
    }
}
