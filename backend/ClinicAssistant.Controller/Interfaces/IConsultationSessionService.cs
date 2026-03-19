using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Enums;

namespace ClinicAssistant.Controller.Interfaces;

public interface IConsultationSessionService
{
    Task<SessionCreatedResponseDTO> CreateSessionAsync(SessionPostDTO dto);
    Task<SessionDetailResponseDTO> GetSessionAsync(Guid sessionId);
    Task<IEnumerable<TranscriptSegmentResponseDTO>> GetTranscriptAsync(Guid sessionId);
    Task StopSessionAsync(Guid sessionId, byte[] pcmData, CancellationToken ct);
    Task UpdateStatusAsync(Guid sessionId, SessionStatus status);
}
