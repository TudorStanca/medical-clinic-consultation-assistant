using ClinicAssistant.Domain.DTOs;
using FluentValidation;

namespace ClinicAssistant.Domain.Validators;

public class LetterAccessGrantPostDTOValidator : AbstractValidator<LetterAccessGrantPostDTO>
{
    public LetterAccessGrantPostDTOValidator()
    {
        RuleFor(x => x.GranteeDoctorId).NotEmpty();
        RuleFor(x => x.SourceDoctorId).NotEmpty();
        RuleFor(x => x)
            .Must(x => x.GranteeDoctorId != x.SourceDoctorId)
            .WithMessage("Grantee doctor and source doctor must be different.");
    }
}
