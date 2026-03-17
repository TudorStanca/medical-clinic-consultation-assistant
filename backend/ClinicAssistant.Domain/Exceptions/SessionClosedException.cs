using System.Net;

namespace ClinicAssistant.Domain.Exceptions;

public class SessionClosedException(string message) : CustomException(message, HttpStatusCode.Conflict) { }
