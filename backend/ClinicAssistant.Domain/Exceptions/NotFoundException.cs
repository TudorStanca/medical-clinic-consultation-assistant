using System.Net;

namespace ClinicAssistant.Domain.Exceptions;
public class NotFoundException(string message) : CustomException(message, HttpStatusCode.NotFound) { }
