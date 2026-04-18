namespace ClinicAssistant.Service;

public class LlmSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string ModelId { get; set; } = "claude-opus-4-6";
    public int MaxTokens { get; set; } = 2048;
    public bool UseStub { get; set; } = true;
    public string FewShotPath { get; set; } = "Assets/LlmFewShot";
}
