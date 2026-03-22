using ClinicAssistant.Domain.Constants;
using ClinicAssistant.Domain.DTOs;
using FluentValidation;

namespace ClinicAssistant.Domain.Validators;

public class DoctorPostDTOValidator : AbstractValidator<DoctorPostDTO>
{
    public DoctorPostDTOValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("FirstName is required.")
            .MaximumLength(ValidationConstants.NameMaxLength).WithMessage($"FirstName must not exceed {ValidationConstants.NameMaxLength} characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("LastName is required.")
            .MaximumLength(ValidationConstants.NameMaxLength).WithMessage($"LastName must not exceed {ValidationConstants.NameMaxLength} characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Email must be a valid email address.")
            .MaximumLength(ValidationConstants.EmailMaxLength).WithMessage($"Email must not exceed {ValidationConstants.EmailMaxLength} characters.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(ValidationConstants.PasswordMinLength).WithMessage($"Password must be at least {ValidationConstants.PasswordMinLength} characters.")
            .MaximumLength(ValidationConstants.PasswordMaxLength).WithMessage($"Password must not exceed {ValidationConstants.PasswordMaxLength} characters.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("PhoneNumber is required.")
            .MaximumLength(ValidationConstants.PhoneNumberMaxLength).WithMessage($"PhoneNumber must not exceed {ValidationConstants.PhoneNumberMaxLength} characters.");

        RuleFor(x => x.Specialization)
            .NotEmpty().WithMessage("Specialization is required.")
            .MaximumLength(ValidationConstants.SpecializationMaxLength).WithMessage($"Specialization must not exceed {ValidationConstants.SpecializationMaxLength} characters.");

        RuleFor(x => x.CodParafa)
            .NotEmpty().WithMessage("CodParafa is required.")
            .MaximumLength(ValidationConstants.CodParafaMaxLength).WithMessage($"CodParafa must not exceed {ValidationConstants.CodParafaMaxLength} characters.");
    }
}
