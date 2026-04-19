using ClinicAssistant.Domain.Constants;
using ClinicAssistant.Domain.DTOs;
using FluentValidation;

namespace ClinicAssistant.Domain.Validators;

public class ResetPasswordDTOValidator : AbstractValidator<ResetPasswordDTO>
{
    public ResetPasswordDTOValidator()
    {
        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("NewPassword is required.")
            .MinimumLength(ValidationConstants.PasswordMinLength).WithMessage($"NewPassword must be at least {ValidationConstants.PasswordMinLength} characters.")
            .MaximumLength(ValidationConstants.PasswordMaxLength).WithMessage($"NewPassword must not exceed {ValidationConstants.PasswordMaxLength} characters.");
    }
}
