namespace ClinicAssistant.Service;

public class LlmSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string ModelId { get; set; } = "claude-sonnet-4-6";
    public int MaxTokens { get; set; } = 2048;
    public bool UseStub { get; set; } = true;
    public string FewShotPath { get; set; } = "Assets/LlmFewShot";
    public string SystemPromptPath { get; set; } = "Assets/system-prompt.txt";
    public string ApiUrl { get; set; } = "https://api.anthropic.com/v1/messages";
    public string AnthropicVersion { get; set; } = "2023-06-01";
    public bool LogPrompts { get; set; } = false;
    public bool LogResponses { get; set; } = false;
}
