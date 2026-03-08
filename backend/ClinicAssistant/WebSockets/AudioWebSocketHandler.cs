using System.Net.WebSockets;
using ClinicAssistant.Controller.Interfaces;
using log4net;

namespace ClinicAssistant.WebSockets;

public static class AudioWebSocketHandler
{
    private static readonly ILog Log = LogManager.GetLogger(typeof(AudioWebSocketHandler));

    public static async Task HandleAsync(HttpContext context, Guid sessionId, IServiceScopeFactory scopeFactory)
    {
        if (!context.WebSockets.IsWebSocketRequest)
        {
            context.Response.StatusCode = 400;
            return;
        }

        // Validate session exists before accepting
        using (var scope = scopeFactory.CreateScope())
        {
            var service = scope.ServiceProvider.GetRequiredService<ITranscriptionService>();
            await service.GetSession(sessionId);
        }

        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Log.Info($"WebSocket accepted for session {sessionId}.");

        var receiveBuffer = new byte[32 * 1024];
        using var pcmBuffer = new MemoryStream();

        try
        {
            WebSocketReceiveResult result;
            do
            {
                result = await webSocket.ReceiveAsync(receiveBuffer, context.RequestAborted);
                if (result.MessageType == WebSocketMessageType.Binary && result.Count > 0)
                {
                    await pcmBuffer.WriteAsync(receiveBuffer.AsMemory(0, result.Count), context.RequestAborted);
                }
            } while (result.MessageType != WebSocketMessageType.Close);

            Log.Info($"WebSocket closed for session {sessionId}. Received {pcmBuffer.Length / 1024} KB of PCM.");
        }
        catch (OperationCanceledException)
        {
            Log.Warn($"WebSocket receive cancelled for session {sessionId}.");
        }
        catch (WebSocketException ex)
        {
            Log.Warn($"WebSocket error for session {sessionId}: {ex.Message}");
        }

        var pcmBytes = pcmBuffer.ToArray();

        using var stopScope = scopeFactory.CreateScope();
        var stopService = stopScope.ServiceProvider.GetRequiredService<ITranscriptionService>();

        await stopService.StopSessionAsync(sessionId, pcmBytes, CancellationToken.None);
    }
}
