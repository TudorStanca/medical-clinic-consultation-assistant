using System.Text;
using System.Text.Json;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Service.Interfaces;
using log4net;
using Microsoft.Extensions.Options;

namespace ClinicAssistant.Service;

public class ClaudeService : ILlmService
{
    private readonly ILog _logger = LogManager.GetLogger(typeof(ClaudeService));
    private readonly HttpClient _httpClient;
    private readonly LlmSettings _settings;
    private readonly List<(string Input, string Output)> _fewShotPairs;

    private const string ApiUrl = "https://api.anthropic.com/v1/messages";
    private const string AnthropicVersion = "2023-06-01";
    private const string SystemPrompt =
        "Ești un asistent medical specializat în generarea de rapoarte medicale în limba română.\n" +
        "Pe baza transcrierii unei consultații medicale, generezi un raport medical structurat.\n" +
        "Returnează STRICT un obiect JSON valid cu exact aceste 6 câmpuri (valorile pot fi string sau null dacă informația nu este prezentă în transcriere):\n" +
        "{\"Antecedente\": ..., \"Simptome\": ..., \"Clinice\": ..., \"Paraclinice\": ..., \"Diagnostic\": ..., \"Recomandari\": ...}\n" +
        "Nu adăuga niciun text în afara obiectului JSON. Nu folosi marcaje ```json``` sau similare.";

    public ClaudeService(HttpClient httpClient, IOptions<LlmSettings> options)
    {
        _httpClient = httpClient;
        _settings = options.Value;
        _fewShotPairs = LoadFewShotPairs(Path.GetFullPath(_settings.FewShotPath));
        _logger.Info($"ClaudeService initialized with {_fewShotPairs.Count} few-shot example(s). Model: {_settings.ModelId}.");
    }

    public async Task<MedicalLetterContentDTO> GenerateLetterAsync(string transcript, string letterType, CancellationToken ct)
    {
        _logger.Info($"Generating letter of type '{letterType}'. Transcript length: {transcript.Length} chars. Few-shot pairs: {_fewShotPairs.Count}.");

        var userContent = BuildUserMessage(transcript, letterType);

        var requestBody = new
        {
            model = _settings.ModelId,
            max_tokens = _settings.MaxTokens,
            system = SystemPrompt,
            messages = new[]
            {
                new { role = "user", content = userContent }
            }
        };

        var requestJson = JsonSerializer.Serialize(requestBody);

        using var request = new HttpRequestMessage(HttpMethod.Post, ApiUrl);
        request.Headers.Add("x-api-key", _settings.ApiKey);
        request.Headers.Add("anthropic-version", AnthropicVersion);
        request.Content = new StringContent(requestJson, Encoding.UTF8, "application/json");

        using var response = await _httpClient.SendAsync(request, ct);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            _logger.Error($"Claude API returned {(int)response.StatusCode}: {errorBody}");
            throw new InvalidOperationException($"Claude API error ({(int)response.StatusCode}): {errorBody}");
        }

        var responseBody = await response.Content.ReadAsStringAsync(ct);

        using var doc = JsonDocument.Parse(responseBody);
        var text = doc.RootElement
            .GetProperty("content")[0]
            .GetProperty("text")
            .GetString()
            ?? throw new InvalidOperationException("Claude API returned an empty text response.");

        _logger.Info($"Claude API response received. Raw JSON length: {text.Length}.");

        var content = JsonSerializer.Deserialize<MedicalLetterContentDTO>(text.Trim(), new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? throw new InvalidOperationException("Failed to deserialize Claude API response into MedicalLetterContentDTO.");

        return content;
    }

    private string BuildUserMessage(string transcript, string letterType)
    {
        var sb = new StringBuilder();

        for (int i = 0; i < _fewShotPairs.Count; i++)
        {
            var pair = _fewShotPairs[i];
            sb.AppendLine($"=== EXEMPLU {i + 1} ===");
            sb.AppendLine("TRANSCRIERE:");
            sb.AppendLine(pair.Input.Trim());
            sb.AppendLine();
            sb.AppendLine("RAPORT JSON:");
            sb.AppendLine(pair.Output.Trim());
            sb.AppendLine();
        }

        sb.AppendLine("=== CONSULTAȚIE NOUĂ ===");
        sb.AppendLine($"Tip scrisoare: {letterType}");
        sb.AppendLine("TRANSCRIERE:");
        sb.AppendLine(transcript.Trim());
        sb.AppendLine();
        sb.Append("RAPORT JSON:");

        return sb.ToString();
    }

    private static List<(string Input, string Output)> LoadFewShotPairs(string directoryPath)
    {
        var pairs = new List<(string, string)>();

        if (string.IsNullOrWhiteSpace(directoryPath) || !Directory.Exists(directoryPath))
        {
            return pairs;
        }

        for (int i = 1; ; i++)
        {
            var inputFile = Path.Combine(directoryPath, $"input-{i}.txt");
            var outputFile = Path.Combine(directoryPath, $"output-{i}.json");

            if (!File.Exists(inputFile) || !File.Exists(outputFile))
            {
                break;
            }

            pairs.Add((File.ReadAllText(inputFile), File.ReadAllText(outputFile)));
        }

        return pairs;
    }
}
