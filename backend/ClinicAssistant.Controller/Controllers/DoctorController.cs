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
    [ProducesResponseType(typeof(PagedResponseDTO<DoctorResponseDTO>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    public async Task<ActionResult> GetAllDoctors([FromQuery] PagedQueryDTO query)
    {
        _logger.Info($"Received request to get doctors. Page={query.Page} Search={query.Search}");
        var result = await _doctorService.GetPagedAsync(query);

        return Ok(result);
    }

    [HttpGet("me/stats")]
    [Authorize(Roles = Roles.Doctor)]
    [ProducesResponseType(typeof(DoctorStatsResponseDTO), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    public async Task<ActionResult> GetMyStats()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        _logger.Info($"Received stats request for doctor: {userId}");
        var stats = await _doctorService.GetStatsAsync(userId);

        return Ok(stats);
    }

    [HttpGet("{id}/stats")]
    [Authorize(Roles = Roles.Admin)]
    [ProducesResponseType(typeof(DoctorStatsResponseDTO), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetDoctorStats(string id)
    {
        _logger.Info($"Received stats request for doctor {id} by admin");
        var stats = await _doctorService.GetStatsAsync(id);

        return Ok(stats);
    }
}
