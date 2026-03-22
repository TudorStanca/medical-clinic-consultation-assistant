namespace ClinicAssistant.Domain.Entities;

public class TranscriptSegment
{
    public int Id { get; set; }
    public Guid SessionId { get; set; }
    public long StartMs { get; set; }
    public long EndMs { get; set; }
    public required string Text { get; set; }

    public ConsultationSession Session { get; set; } = null!;
}
