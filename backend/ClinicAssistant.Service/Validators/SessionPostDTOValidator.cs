using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Service.Interfaces;
using FluentValidation;

namespace ClinicAssistant.Service.Validators;

public class SessionPostDTOValidator : AbstractValidator<SessionPostDTO>
{
    public SessionPostDTOValidator(IUserRepository userRepo)
    {
        RuleFor(x => x.PatientId)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("PatientId is required.")
            .MustAsync(async (id, ct) => await userRepo.GetPatientByIdAsync(id) != null)
            .WithMessage("Patient not found.");
    }
}
