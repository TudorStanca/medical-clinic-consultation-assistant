using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Constants;
using ClinicAssistant.Domain.DTOs;
using log4net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicAssistant.Controller.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorController(IDoctorService doctorService) : ControllerBase
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(DoctorController));
    private readonly IDoctorService _doctorService = doctorService;

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    [ProducesResponseType(typeof(DoctorResponseDTO), 201)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> CreateDoctor([FromBody] DoctorPostDTO dto)
    {
        _logger.Info($"Received request to create doctor: {dto.Email}");
        var doctor = await _doctorService.CreateDoctorAsync(dto);

        return CreatedAtAction(nameof(GetDoctor), new { id = doctor.Id }, doctor);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Doctor}")]
    [ProducesResponseType(typeof(DoctorResponseDTO), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetDoctor(string id)
    {
        _logger.Info($"Received request to get doctor: {id}");
        var doctor = await _doctorService.GetByIdAsync(id);

        return Ok(doctor);
    }

    [HttpGet]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Doctor}")]
    [ProducesResponseType(typeof(IEnumerable<DoctorResponseDTO>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    public async Task<ActionResult> GetAllDoctors()
    {
        _logger.Info("Received request to get all doctors.");
        var doctors = await _doctorService.GetAllAsync();

        return Ok(doctors);
    }
}
