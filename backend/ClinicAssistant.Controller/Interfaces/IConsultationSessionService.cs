using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Enums;

namespace ClinicAssistant.Controller.Interfaces;

public interface IConsultationSessionService
{
    Task<SessionCreatedResponseDTO> CreateSessionAsync(SessionPostDTO dto);
    Task<SessionDetailResponseDTO> GetSessionAsync(Guid sessionId);
    Task<IEnumerable<TranscriptSegmentResponseDTO>> GetTranscriptAsync(Guid sessionId);
    Task<PagedResponseDTO<SessionSummaryResponseDTO>> GetSessionsPagedForUserAsync(string userId, IEnumerable<string> roles, PagedQueryDTO query);
    Task StopSessionAsync(Guid sessionId, byte[] pcmData, CancellationToken ct);
    Task UpdateStatusAsync(Guid sessionId, SessionStatus status);
    Task DeleteSessionAsync(Guid sessionId, string requestingDoctorId);
    Task SetPatientTranscriptAccessAsync(Guid sessionId, string requestingDoctorId, bool allow);
    Task<DashboardStatsResponseDTO> GetDashboardStatsAsync(string userId, IEnumerable<string> roles);
    Task SetAudioFilePathAsync(Guid sessionId, string audioFilePath);
    Task<int> CleanupInterruptedAsync(CancellationToken ct = default);
}
