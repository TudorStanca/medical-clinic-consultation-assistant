namespace ClinicAssistant.Configuration;

public class WhisperSettings
{
    public required string ModelFileName { get; set; }
    public required string Language { get; set; }
    public bool UseCuda { get; set; }
    public bool UseStub { get; set; }
}
