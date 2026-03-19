using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Service.Interfaces;
using FluentValidation;

namespace ClinicAssistant.Service.Validators;

public class SessionPostDTOValidator : AbstractValidator<SessionPostDTO>
{
    public SessionPostDTOValidator(IUserRepository userRepo)
    {
        RuleFor(x => x.DoctorId)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("DoctorId is required.")
            .MustAsync(async (id, ct) => await userRepo.GetDoctorByIdAsync(id) != null)
            .WithMessage("Doctor not found.");

        RuleFor(x => x.PatientId)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("PatientId is required.")
            .MustAsync(async (id, ct) => await userRepo.GetPatientByIdAsync(id) != null)
            .WithMessage("Patient not found.");
    }
}
