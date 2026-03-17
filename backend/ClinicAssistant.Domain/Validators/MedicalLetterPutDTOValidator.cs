using ClinicAssistant.Domain.DTOs;
using FluentValidation;

namespace ClinicAssistant.Domain.Validators;

public class MedicalLetterPutDTOValidator : AbstractValidator<MedicalLetterPutDTO>
{
    public MedicalLetterPutDTOValidator()
    {
        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Location is required.");

        RuleFor(x => x)
            .Must(x =>
                !string.IsNullOrWhiteSpace(x.Antecedente) ||
                !string.IsNullOrWhiteSpace(x.Simptome) ||
                !string.IsNullOrWhiteSpace(x.Clinice) ||
                !string.IsNullOrWhiteSpace(x.Paraclinice) ||
                !string.IsNullOrWhiteSpace(x.Diagnostic) ||
                !string.IsNullOrWhiteSpace(x.Recomandari))
            .WithMessage("At least one content field must be provided.");
    }
}
