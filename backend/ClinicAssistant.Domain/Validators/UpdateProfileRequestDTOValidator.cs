using ClinicAssistant.Domain.Constants;
using ClinicAssistant.Domain.DTOs;
using FluentValidation;

namespace ClinicAssistant.Domain.Validators;

public class UpdateProfileRequestDTOValidator : AbstractValidator<UpdateProfileRequestDTO>
{
    public UpdateProfileRequestDTOValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("FirstName is required.")
            .MaximumLength(ValidationConstants.NameMaxLength).WithMessage($"FirstName must not exceed {ValidationConstants.NameMaxLength} characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("LastName is required.")
            .MaximumLength(ValidationConstants.NameMaxLength).WithMessage($"LastName must not exceed {ValidationConstants.NameMaxLength} characters.");

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(ValidationConstants.PhoneNumberMaxLength).WithMessage($"PhoneNumber must not exceed {ValidationConstants.PhoneNumberMaxLength} characters.")
            .When(x => x.PhoneNumber is not null);
    }
}
