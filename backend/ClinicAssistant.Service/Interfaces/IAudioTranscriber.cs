using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Interfaces;

public interface IAudioTranscriber
{
    Task<IReadOnlyList<TranscriptSegment>> FinalizeSessionAsync(IReadOnlyList<string> audioPaths, CancellationToken ct);
}
