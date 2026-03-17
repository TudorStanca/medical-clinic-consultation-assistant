using System.Net;

namespace ClinicAssistant.Domain.Exceptions;

public class EntityValidationException(IEnumerable<string> errors)
    : CustomException("Validation failed.", HttpStatusCode.UnprocessableEntity)
{
    public IEnumerable<string> Errors { get; } = errors;
}
