using ClinicAssistant.Domain.DTOs;
using FluentValidation;

namespace ClinicAssistant.Domain.Validators;

public class SessionPostDTOValidator : AbstractValidator<SessionPostDTO>
{
    public SessionPostDTOValidator()
    {
        RuleFor(x => x.DoctorId)
            .NotEmpty().WithMessage("DoctorId is required.");

        RuleFor(x => x.PatientId)
            .NotEmpty().WithMessage("PatientId is required.");
    }
}
