using System.Net.WebSockets;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Service;
using ClinicAssistant.Service.Interfaces;
using log4net;
using Microsoft.Extensions.Options;

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

        string audioFilePath;
        using (var configScope = scopeFactory.CreateScope())
        {
            var fileStorage = configScope.ServiceProvider.GetRequiredService<IOptions<FileStorageSettings>>().Value;
            Directory.CreateDirectory(fileStorage.AudioPath);
            audioFilePath = Path.Combine(fileStorage.AudioPath, $"{sessionId}-stream.pcm");
        }

        using (var initScope = scopeFactory.CreateScope())
        {
            var initService = initScope.ServiceProvider.GetRequiredService<IConsultationSessionService>();
            await initService.SetAudioFilePathAsync(sessionId, audioFilePath);
        }

        try
        {
            var receiveBuffer = new byte[32 * 1024];
            using var cts = new CancellationTokenSource();

            await using (var fileStream = new FileStream(
                audioFilePath, FileMode.Create, FileAccess.Write, FileShare.Read, 32 * 1024, useAsync: true))
            {
                var periodicTask = RunPeriodicTranscriptionAsync(sessionId, audioFilePath, fileStream, scopeFactory, cts.Token);

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

            var pcmBytes = await File.ReadAllBytesAsync(audioFilePath, CancellationToken.None);

            using var stopScope = scopeFactory.CreateScope();
            var stopService = stopScope.ServiceProvider.GetRequiredService<IConsultationSessionService>();
            await stopService.StopSessionAsync(sessionId, pcmBytes, CancellationToken.None);
        }
        finally
        {
            if (File.Exists(audioFilePath))
            {
                File.Delete(audioFilePath);
            }
        }
    }

    private const int BytesPerSecond = 16000 * 2; // 16kHz mono 16-bit PCM
    private const long OverlapBytes = BytesPerSecond * 1; // 1s overlap at window boundary
    private const long MinWindowBytes = BytesPerSecond * 3; // skip tick if < 3s of new audio

    private static async Task RunPeriodicTranscriptionAsync(
        Guid sessionId,
        string tempPath,
        FileStream writeStream,
        IServiceScopeFactory scopeFactory,
        CancellationToken ct)
    {
        long lastPublishedEndMs = 0;
        long lastProcessedByteOffset = 0;
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(15));

        try
        {
            while (await timer.WaitForNextTickAsync(ct))
            {
                try
                {
                    await writeStream.FlushAsync(ct);

                    var fileLength = writeStream.Length;
                    var newBytes = fileLength - lastProcessedByteOffset;
                    if (newBytes < MinWindowBytes)
                    {
                        continue;
                    }

                    var seekPosition = Math.Max(0L, lastProcessedByteOffset - OverlapBytes);
                    var windowLength = (int)(fileLength - seekPosition);
                    var window = new byte[windowLength];

                    await using (var readStream = new FileStream(
                        tempPath,
                        FileMode.Open,
                        FileAccess.Read,
                        FileShare.ReadWrite,
                        bufferSize: 64 * 1024,
                        useAsync: true))
                    {
                        readStream.Seek(seekPosition, SeekOrigin.Begin);
                        await readStream.ReadExactlyAsync(window, ct);
                    }

                    using var scope = scopeFactory.CreateScope();
                    var transcriber = scope.ServiceProvider.GetRequiredService<IAudioTranscriber>();
                    var publisher = scope.ServiceProvider.GetRequiredService<ITranscriptPublisher>();

                    var rawSegments = await transcriber.TranscribePcmAsync(window, ct);

                    var offsetMs = seekPosition * 1000 / BytesPerSecond;
                    var newSegments = rawSegments
                        .Select(s => new TranscriptSegment
                        {
                            SessionId = sessionId,
                            StartMs = s.StartMs + offsetMs,
                            EndMs = s.EndMs + offsetMs,
                            Text = s.Text
                        })
                        .Where(s => s.StartMs > lastPublishedEndMs)
                        .ToList();

                    foreach (var seg in newSegments)
                    {
                        await publisher.PublishSegmentAsync(sessionId, seg, ct);
                    }

                    lastProcessedByteOffset = fileLength;

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
