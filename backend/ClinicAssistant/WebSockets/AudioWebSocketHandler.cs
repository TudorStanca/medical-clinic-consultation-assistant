using System.Net.WebSockets;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Service.Interfaces;
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
            using var cts = new CancellationTokenSource();

            await using (var fileStream = new FileStream(
                tempPath, FileMode.Open, FileAccess.Write, FileShare.Read, 32 * 1024, useAsync: true))
            {
                var periodicTask = RunPeriodicTranscriptionAsync(sessionId, tempPath, fileStream, scopeFactory, cts.Token);

                try
                {
                    WebSocketReceiveResult result;
                    do
                    {
                        result = await webSocket.ReceiveAsync(receiveBuffer, context.RequestAborted);
                        if (result.MessageType == WebSocketMessageType.Binary && result.Count > 0)
                        {
                            await fileStream.WriteAsync(receiveBuffer.AsMemory(0, result.Count), context.RequestAborted);
                        }
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

                await cts.CancelAsync();
                try
                {
                    await periodicTask;
                }
                catch (OperationCanceledException) { }
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

    private static async Task RunPeriodicTranscriptionAsync(
        Guid sessionId,
        string tempPath,
        FileStream writeStream,
        IServiceScopeFactory scopeFactory,
        CancellationToken ct)
    {
        long lastPublishedEndMs = 0;
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(15));

        try
        {
            while (await timer.WaitForNextTickAsync(ct))
            {
                try
                {
                    await writeStream.FlushAsync(ct);

                    var snapshot = await File.ReadAllBytesAsync(tempPath, ct);
                    if (snapshot.Length == 0)
                    {
                        continue;
                    }

                    using var scope = scopeFactory.CreateScope();
                    var transcriber = scope.ServiceProvider.GetRequiredService<IAudioTranscriber>();
                    var publisher = scope.ServiceProvider.GetRequiredService<ITranscriptPublisher>();

                    var segments = await transcriber.TranscribePcmAsync(snapshot, ct);

                    var newSegments = segments.Where(s => s.StartMs >= lastPublishedEndMs).ToList();
                    foreach (var seg in newSegments)
                    {
                        await publisher.PublishSegmentAsync(sessionId, new TranscriptSegment
                        {
                            SessionId = sessionId,
                            StartMs = seg.StartMs,
                            EndMs = seg.EndMs,
                            Text = seg.Text
                        }, ct);
                    }

                    if (newSegments.Count > 0)
                    {
                        lastPublishedEndMs = newSegments.Max(s => s.EndMs);
                        Log.Info($"Session {sessionId}: published {newSegments.Count} preview segment(s). LastEndMs={lastPublishedEndMs}.");
                    }
                }
                catch (OperationCanceledException) when (ct.IsCancellationRequested)
                {
                    return;
                }
                catch (Exception ex)
                {
                    Log.Warn($"Session {sessionId}: periodic transcription tick failed. {ex.Message}");
                }
            }
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested) { }
    }
}
