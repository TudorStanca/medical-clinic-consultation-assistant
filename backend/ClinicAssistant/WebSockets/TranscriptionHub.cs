using log4net;
using Microsoft.AspNetCore.SignalR;

namespace ClinicAssistant.WebSockets;

public class TranscriptionHub : Hub
{
    private static readonly ILog _logger = LogManager.GetLogger(typeof(TranscriptionHub));

    public async Task JoinSession(string sessionId)
    {
        _logger.Info($"Connection {Context.ConnectionId} joining session {sessionId}");

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(sessionId));
    }

    public async Task LeaveSession(string sessionId)
    {
        _logger.Info($"Connection {Context.ConnectionId} leaving session {sessionId}");

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(sessionId));
    }

    internal static string GroupName(string sessionId) => $"session:{sessionId}";
}
