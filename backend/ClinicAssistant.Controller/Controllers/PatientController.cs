using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.DTOs;
using log4net;
using Microsoft.AspNetCore.Mvc;

namespace ClinicAssistant.Controller.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientController(IPatientService patientService) : ControllerBase
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(PatientController));
    private readonly IPatientService _patientService = patientService;

    [HttpPost]
    [ProducesResponseType(typeof(PatientResponseDTO), 201)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> CreatePatient([FromBody] PatientPostDTO dto)
    {
        _logger.Info($"Received request to create patient: {dto.Email}");
        var patient = await _patientService.CreatePatientAsync(dto);
        return CreatedAtAction(nameof(GetPatient), new { id = patient.Id }, patient);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PatientResponseDTO), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetPatient(string id)
    {
        _logger.Info($"Received request to get patient: {id}");
        var patient = await _patientService.GetByIdAsync(id);
        return Ok(patient);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PatientResponseDTO>), 200)]
    public async Task<ActionResult> GetAllPatients()
    {
        _logger.Info("Received request to get all patients.");
        var patients = await _patientService.GetAllAsync();
        return Ok(patients);
    }
}
