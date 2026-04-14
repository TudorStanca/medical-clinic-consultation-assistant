using AutoMapper;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Exceptions;
using ClinicAssistant.Service.Interfaces;
using FluentValidation;
using log4net;

namespace ClinicAssistant.Service;

public class PatientService(IUserRepository userRepo, IMapper mapper, IValidator<PatientPostDTO> validator)
    : IPatientService
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(PatientService));
    private readonly IUserRepository _userRepo = userRepo;
    private readonly IMapper _mapper = mapper;
    private readonly IValidator<PatientPostDTO> _validator = validator;

    public async Task<PatientResponseDTO> CreatePatientAsync(PatientPostDTO dto)
    {
        _logger.Info($"Creating patient: {dto.Email}");

        var result = await _validator.ValidateAsync(dto);
        if (!result.IsValid)
        {
            throw new EntityValidationException(result.Errors.Select(e => e.ErrorMessage));
        }

        if (await _userRepo.IdentityNumberExistsAsync(dto.IdentityNumber))
        {
            throw new EntityValidationException([$"A patient with identity number '{dto.IdentityNumber}' already exists."]);
        }

        var patient = _mapper.Map<Patient>(dto);

        var (success, errors) = await _userRepo.CreatePatientAsync(patient, dto.Password);
        if (!success)
        {
            throw new EntityValidationException(errors);
        }

        return _mapper.Map<PatientResponseDTO>(patient);
    }

    public async Task<PatientResponseDTO> GetByIdAsync(string id)
    {
        _logger.Info($"Getting patient: {id}");

        var patient = await _userRepo.GetPatientByIdAsync(id)
            ?? throw new NotFoundException($"Patient {id} not found.");

        return _mapper.Map<PatientResponseDTO>(patient);
    }

    public async Task<IEnumerable<PatientResponseDTO>> GetAllAsync()
    {
        _logger.Info("Getting all patients.");

        var patients = await _userRepo.GetAllPatientsAsync();

        return patients.Select(p => _mapper.Map<PatientResponseDTO>(p));
    }
}
