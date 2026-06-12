using System.Net;

namespace ClinicAssistant.Domain.Exceptions;
public class ConflictException(string message) : CustomException(message, HttpStatusCode.Conflict) { }
