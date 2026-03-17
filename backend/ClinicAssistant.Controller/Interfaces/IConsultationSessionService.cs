using ClinicAssistant.Domain.DTOs;

namespace ClinicAssistant.Controller.Interfaces;

public interface IConsultationSessionService
{
    Task<SessionCreatedResponseDTO> CreateSessionAsync(SessionPostDTO dto);
    Task<SessionDetailResponseDTO> GetSessionAsync(Guid sessionId);
    Task<IEnumerable<TranscriptSegmentResponseDTO>> GetTranscriptAsync(Guid sessionId);
    Task StopSessionAsync(Guid sessionId, byte[] pcmData, CancellationToken ct);
}
