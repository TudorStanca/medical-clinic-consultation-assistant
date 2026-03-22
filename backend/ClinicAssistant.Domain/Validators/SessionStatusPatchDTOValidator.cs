using ClinicAssistant.Domain.DTOs;
using FluentValidation;

namespace ClinicAssistant.Domain.Validators;

public class SessionStatusPatchDTOValidator : AbstractValidator<SessionStatusPatchDTO>
{
    public SessionStatusPatchDTOValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Status must be a valid SessionStatus value.");
    }
}
