using ClinicAssistant.Domain.Constants;
using ClinicAssistant.Domain.DTOs;
using FluentValidation;

namespace ClinicAssistant.Domain.Validators;

public class PatientPostDTOValidator : AbstractValidator<PatientPostDTO>
{
    public PatientPostDTOValidator()
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

        RuleFor(x => x.IdentityNumber)
            .NotEmpty().WithMessage("IdentityNumber is required.")
            .Matches(@"^\d{13}$").WithMessage($"IdentityNumber must be exactly {ValidationConstants.IdentityNumberLength} digits.");

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Address is required.")
            .MaximumLength(ValidationConstants.AddressMaxLength).WithMessage($"Address must not exceed {ValidationConstants.AddressMaxLength} characters.");

        RuleFor(x => x.BirthDate)
            .LessThan(DateTime.UtcNow).WithMessage("BirthDate must be in the past.");

        RuleFor(x => x.Sex)
            .IsInEnum().WithMessage("Sex must be a valid value (Male, Female, Other).");
    }
}
