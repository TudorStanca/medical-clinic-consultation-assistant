using AutoMapper;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Exceptions;
using ClinicAssistant.Service.Interfaces;
using FluentValidation;
using log4net;

namespace ClinicAssistant.Service;

public class DoctorService(IUserRepository userRepo, IMapper mapper, IValidator<DoctorPostDTO> validator)
    : IDoctorService
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(DoctorService));
    private readonly IUserRepository _userRepo = userRepo;
    private readonly IMapper _mapper = mapper;
    private readonly IValidator<DoctorPostDTO> _validator = validator;

    public async Task<DoctorResponseDTO> CreateDoctorAsync(DoctorPostDTO dto)
    {
        _logger.Info($"Creating doctor: {dto.Email}");

        var result = await _validator.ValidateAsync(dto);
        if (!result.IsValid)
            throw new EntityValidationException(result.Errors.Select(e => e.ErrorMessage));

        var doctor = _mapper.Map<Doctor>(dto);

        var (success, errors) = await _userRepo.CreateDoctorAsync(doctor, dto.Password);
        if (!success)
            throw new EntityValidationException(errors);

        return _mapper.Map<DoctorResponseDTO>(doctor);
    }

    public async Task<DoctorResponseDTO> GetByIdAsync(string id)
    {
        _logger.Info($"Getting doctor: {id}");

        var doctor = await _userRepo.GetDoctorByIdAsync(id)
            ?? throw new NotFoundException($"Doctor {id} not found.");

        return _mapper.Map<DoctorResponseDTO>(doctor);
    }

    public async Task<IEnumerable<DoctorResponseDTO>> GetAllAsync()
    {
        _logger.Info("Getting all doctors.");

        var doctors = await _userRepo.GetAllDoctorsAsync();
        return doctors.Select(d => _mapper.Map<DoctorResponseDTO>(d));
    }
}
