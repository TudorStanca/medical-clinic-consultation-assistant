namespace ClinicAssistant.Domain.DTOs;

public record SessionDetailResponseDTO(Guid SessionId, string Status, int SegmentCount);
