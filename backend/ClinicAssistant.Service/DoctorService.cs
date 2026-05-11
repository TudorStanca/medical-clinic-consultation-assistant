using AutoMapper;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Exceptions;
using ClinicAssistant.Service.Interfaces;
using FluentValidation;
using log4net;

namespace ClinicAssistant.Service;

public class DoctorService(IUserRepository userRepo, IMapper mapper, IValidator<DoctorPostDTO> validator, IConsultationSessionRepository sessionRepo, IMedicalLetterRepository letterRepo)
    : IDoctorService
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(DoctorService));
    private readonly IUserRepository _userRepo = userRepo;
    private readonly IMapper _mapper = mapper;
    private readonly IValidator<DoctorPostDTO> _validator = validator;
    private readonly IConsultationSessionRepository _sessionRepo = sessionRepo;
    private readonly IMedicalLetterRepository _letterRepo = letterRepo;

    public async Task<DoctorResponseDTO> CreateDoctorAsync(DoctorPostDTO dto)
    {
        _logger.Info($"Creating doctor: {dto.Email}");

        var result = await _validator.ValidateAsync(dto);
        if (!result.IsValid)
        {
            throw new EntityValidationException(result.Errors.Select(e => e.ErrorMessage));
        }

        var doctor = _mapper.Map<Doctor>(dto);

        var (success, errors) = await _userRepo.CreateDoctorAsync(doctor, dto.Password);
        if (!success)
        {
            throw new EntityValidationException(errors);
        }

        return _mapper.Map<DoctorResponseDTO>(doctor);
    }

    public async Task<DoctorResponseDTO> GetByIdAsync(string id)
    {
        _logger.Info($"Getting doctor: {id}");

        var doctor = await _userRepo.GetDoctorByIdAsync(id)
            ?? throw new NotFoundException($"Doctor {id} not found.");

        return _mapper.Map<DoctorResponseDTO>(doctor);
    }

    public async Task<PagedResponseDTO<DoctorResponseDTO>> GetPagedAsync(PagedQueryDTO query)
    {
        _logger.Info($"Getting paged doctors. Page={query.Page} PageSize={query.PageSize} Search={query.Search}");

        var (items, total) = await _userRepo.GetDoctorPagedAsync(query.Page, query.PageSize, query.Search, query.SortBy, query.SortDir);

        return new PagedResponseDTO<DoctorResponseDTO>(
            items.Select(d => _mapper.Map<DoctorResponseDTO>(d)),
            total,
            query.Page,
            query.PageSize);
    }

    public async Task<DoctorStatsResponseDTO> GetStatsAsync(string doctorId)
    {
        _logger.Info($"Getting stats for doctor: {doctorId}");

        var consultationCount = await _sessionRepo.CountByDoctorAsync(doctorId);
        var letterCount = await _letterRepo.CountByDoctorAsync(doctorId);

        return new DoctorStatsResponseDTO(consultationCount, letterCount);
    }
}
