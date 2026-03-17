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
            var service = scope.ServiceProvider.GetRequiredService<IConsultationSessionService>();
            await service.GetSessionAsync(sessionId);
        }

        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Log.Info($"WebSocket accepted for session {sessionId}.");

        var tempPath = Path.GetTempFileName();
        try
        {
            var receiveBuffer = new byte[32 * 1024];

            await using (var fileStream = new FileStream(tempPath, FileMode.Open, FileAccess.Write, FileShare.None, 32 * 1024, useAsync: true))
            {
                try
                {
                    WebSocketReceiveResult result;
                    do
                    {
                        result = await webSocket.ReceiveAsync(receiveBuffer, context.RequestAborted);
                        if (result.MessageType == WebSocketMessageType.Binary && result.Count > 0)
                            await fileStream.WriteAsync(receiveBuffer.AsMemory(0, result.Count), context.RequestAborted);
                    } while (result.MessageType != WebSocketMessageType.Close);

                    Log.Info($"WebSocket closed for session {sessionId}. Received {fileStream.Length / 1024} KB of PCM.");
                }
                catch (OperationCanceledException)
                {
                    Log.Warn($"WebSocket receive cancelled for session {sessionId}.");
                }
                catch (WebSocketException ex)
                {
                    Log.Warn($"WebSocket error for session {sessionId}: {ex.Message}");
                }
            }

            var pcmBytes = await File.ReadAllBytesAsync(tempPath, CancellationToken.None);

            using var stopScope = scopeFactory.CreateScope();
            var stopService = stopScope.ServiceProvider.GetRequiredService<IConsultationSessionService>();
            await stopService.StopSessionAsync(sessionId, pcmBytes, CancellationToken.None);
        }
        finally
        {
            File.Delete(tempPath);
        }
    }
}
