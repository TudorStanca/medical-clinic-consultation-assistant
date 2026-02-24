using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.Interfaces;
using log4net;
using Microsoft.AspNetCore.SignalR;

namespace ClinicAssistant.WebSockets;

public class SignalRTranscriptPublisher(IHubContext<TranscriptionHub> hub) : ITranscriptPublisher
{
    private static readonly ILog _logger = LogManager.GetLogger(typeof(SignalRTranscriptPublisher));

    private readonly IHubContext<TranscriptionHub> _hub = hub;

    public async Task PublishSegmentAsync(Guid sessionId, TranscriptSegment segment, CancellationToken ct)
    {
        _logger.Debug($"Publishing transcript segment for session {sessionId}");

        await _hub.Clients
            .Group(TranscriptionHub.GroupName(sessionId.ToString()))
            .SendAsync(
                "TranscriptSegment",
                new
                {
                    startMs = segment.StartMs,
                    endMs = segment.EndMs,
                    text = segment.Text
                },
                ct
            );
    }

    public async Task PublishStatusAsync(Guid sessionId, string status, CancellationToken ct)
    {
        _logger.Info($"Publishing session status {status} for session {sessionId}");

        await _hub.Clients
            .Group(TranscriptionHub.GroupName(sessionId.ToString()))
            .SendAsync(
                "SessionStatus",
                new
                {
                    sessionId,
                    status
                },
                ct
            );
    }
}
