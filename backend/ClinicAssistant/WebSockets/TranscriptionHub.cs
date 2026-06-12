using System.Security.Claims;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Constants;
using log4net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ClinicAssistant.WebSockets;

[Authorize(Roles = Roles.Doctor)]
public class TranscriptionHub(IConsultationSessionService sessionService) : Hub
{
    private static readonly ILog _logger = LogManager.GetLogger(typeof(TranscriptionHub));
    private readonly IConsultationSessionService _sessionService = sessionService;

    public async Task JoinSession(string sessionId)
    {
        _logger.Info($"Connection {Context.ConnectionId} joining session {sessionId}");

        if (!Guid.TryParse(sessionId, out var sessionGuid))
        {
            throw new HubException("Invalid session id.");
        }

        var session = await _sessionService.GetSessionAsync(sessionGuid);
        var currentUserId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (session.DoctorId != currentUserId)
        {
            throw new HubException("Nu ești autorizat să te alături acestei sesiuni.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(sessionId));
    }

    public async Task LeaveSession(string sessionId)
    {
        _logger.Info($"Connection {Context.ConnectionId} leaving session {sessionId}");

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(sessionId));
    }

    internal static string GroupName(string sessionId) => $"session:{sessionId}";
}
