namespace ClinicAssistant.Domain.Entities;

public class TranscriptSegment
{
    public long StartMs { get; set; }
    public long EndMs { get; set; }
    public required string Text { get; set; }
}
