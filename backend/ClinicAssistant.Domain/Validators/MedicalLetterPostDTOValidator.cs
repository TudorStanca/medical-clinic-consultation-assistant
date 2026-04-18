using ClinicAssistant.Domain.DTOs;
using FluentValidation;

namespace ClinicAssistant.Domain.Validators;

public class MedicalLetterPostDTOValidator : AbstractValidator<MedicalLetterPostDTO>
{
    public MedicalLetterPostDTOValidator()
    {
        RuleFor(x => x.SessionId)
            .NotEmpty().WithMessage("SessionId is required.");

        RuleFor(x => x.LetterType)
            .NotEmpty().WithMessage("LetterType is required.");

        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Location is required.");
    }
}
