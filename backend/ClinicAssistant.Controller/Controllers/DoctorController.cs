using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.DTOs;
using log4net;
using Microsoft.AspNetCore.Mvc;

namespace ClinicAssistant.Controller.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorController(IDoctorService doctorService) : ControllerBase
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(DoctorController));
    private readonly IDoctorService _doctorService = doctorService;

    [HttpPost]
    [ProducesResponseType(typeof(DoctorResponseDTO), 201)]
    [ProducesResponseType(422)]
    public async Task<ActionResult> CreateDoctor([FromBody] DoctorPostDTO dto)
    {
        _logger.Info($"Received request to create doctor: {dto.Email}");
        var doctor = await _doctorService.CreateDoctorAsync(dto);
        return CreatedAtAction(nameof(GetDoctor), new { id = doctor.Id }, doctor);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(DoctorResponseDTO), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetDoctor(string id)
    {
        _logger.Info($"Received request to get doctor: {id}");
        var doctor = await _doctorService.GetByIdAsync(id);
        return Ok(doctor);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<DoctorResponseDTO>), 200)]
    public async Task<ActionResult> GetAllDoctors()
    {
        _logger.Info("Received request to get all doctors.");
        var doctors = await _doctorService.GetAllAsync();
        return Ok(doctors);
    }
}
