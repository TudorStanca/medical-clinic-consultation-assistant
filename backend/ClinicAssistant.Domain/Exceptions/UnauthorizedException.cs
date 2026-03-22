using System.Net;

namespace ClinicAssistant.Domain.Exceptions;

public class UnauthorizedException(string message) : CustomException(message, HttpStatusCode.Unauthorized);
