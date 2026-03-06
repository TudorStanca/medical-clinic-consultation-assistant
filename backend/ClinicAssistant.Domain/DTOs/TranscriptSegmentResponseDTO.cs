namespace ClinicAssistant.Domain.DTOs;

public record TranscriptSegmentResponseDTO(long StartMs, long EndMs, string Text);
