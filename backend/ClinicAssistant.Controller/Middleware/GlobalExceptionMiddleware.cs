using ClinicAssistant.Domain.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Net;

namespace ClinicAssistant.Controller.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "An error occurred.");

        context.Response.ContentType = "application/json";

        object response;
        switch (exception)
        {
            case EntityValidationException validationEx:
                context.Response.StatusCode = (int)validationEx.StatusCode;
                response = new { statusCode = (int)validationEx.StatusCode, message = validationEx.Message, errors = validationEx.Errors };
                break;

            case CustomException customEx:
                context.Response.StatusCode = (int)customEx.StatusCode;
                response = new ExceptionResponse(customEx.StatusCode, customEx.Message);
                break;

            case ValidationException fluentEx:
                context.Response.StatusCode = (int)HttpStatusCode.UnprocessableEntity;
                response = new { statusCode = 422, message = "Validation failed.", errors = fluentEx.Errors.Select(e => e.ErrorMessage) };
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response = new ExceptionResponse(HttpStatusCode.InternalServerError, "Internal server error. Please retry later. " + exception.Message);
                break;
        }

        var json = System.Text.Json.JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(json);
    }
}
