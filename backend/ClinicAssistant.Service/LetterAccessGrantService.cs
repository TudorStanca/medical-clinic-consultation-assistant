using AutoMapper;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.Exceptions;
using ClinicAssistant.Service.Interfaces;
using FluentValidation;
using log4net;

namespace ClinicAssistant.Service;

public class LetterAccessGrantService(
    ILetterAccessGrantRepository grantRepo,
    IUserRepository userRepo,
    IMapper mapper,
    IValidator<LetterAccessGrantPostDTO> validator) : ILetterAccessGrantService
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(LetterAccessGrantService));
    private readonly ILetterAccessGrantRepository _grantRepo = grantRepo;
    private readonly IUserRepository _userRepo = userRepo;
    private readonly IMapper _mapper = mapper;
    private readonly IValidator<LetterAccessGrantPostDTO> _validator = validator;

    public async Task<IEnumerable<LetterAccessGrantResponseDTO>> GetMyGrantsAsync(string patientId)
    {
        _logger.Info($"Getting letter access grants for patient={patientId}.");

        var grants = await _grantRepo.GetByPatientAsync(patientId);

        return grants.Select(g => _mapper.Map<LetterAccessGrantResponseDTO>(g));
    }

    public async Task<LetterAccessGrantResponseDTO> CreateGrantAsync(LetterAccessGrantPostDTO dto, string patientId)
    {
        _logger.Info($"Creating letter access grant: patient={patientId}, grantee={dto.GranteeDoctorId}, source={dto.SourceDoctorId}.");

        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new EntityValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        var granteeDoctor = await _userRepo.GetDoctorByIdAsync(dto.GranteeDoctorId)
            ?? throw new NotFoundException($"Doctor {dto.GranteeDoctorId} not found.");

        var sourceDoctor = await _userRepo.GetDoctorByIdAsync(dto.SourceDoctorId)
            ?? throw new NotFoundException($"Doctor {dto.SourceDoctorId} not found.");

        if (await _grantRepo.ExistsAsync(patientId, dto.GranteeDoctorId, dto.SourceDoctorId))
        {
            throw new ConflictException("Acest acces există deja.");
        }

        var grant = new LetterAccessGrant
        {
            PatientId = patientId,
            GranteeDoctorId = dto.GranteeDoctorId,
            SourceDoctorId = dto.SourceDoctorId
        };

        await _grantRepo.CreateAsync(grant);

        grant.GranteeDoctor = granteeDoctor;
        grant.SourceDoctor = sourceDoctor;

        return _mapper.Map<LetterAccessGrantResponseDTO>(grant);
    }

    public async Task RevokeGrantAsync(Guid grantId, string patientId)
    {
        _logger.Info($"Revoking letter access grant id={grantId} by patient={patientId}.");

        var grant = await _grantRepo.GetByIdAsync(grantId)
            ?? throw new NotFoundException($"Grant {grantId} not found.");

        if (grant.PatientId != patientId)
        {
            throw new UnauthorizedException("Nu ești autorizat să revoci acest acces.");
        }

        await _grantRepo.DeleteAsync(grantId);
    }

    public async Task<bool> HasGrantAsync(string patientId, string granteeDoctorId, string sourceDoctorId)
    {
        return await _grantRepo.HasGrantAsync(patientId, granteeDoctorId, sourceDoctorId);
    }

    public async Task<IEnumerable<DoctorSearchableResponseDTO>> GetSourceDoctorsAsync(string patientId)
    {
        _logger.Info($"Getting source doctors for patient={patientId}.");

        var doctors = await _grantRepo.GetSourceDoctorsAsync(patientId);

        return doctors.Select(d => _mapper.Map<DoctorSearchableResponseDTO>(d));
    }
}
