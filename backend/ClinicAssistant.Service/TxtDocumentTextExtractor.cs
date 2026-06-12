using ClinicAssistant.Service.Interfaces;

namespace ClinicAssistant.Service;

public class TxtDocumentTextExtractor : IDocumentTextExtractor
{
    public string SupportedExtension => ".txt";

    public async Task<string> ExtractTextAsync(string filePath, CancellationToken ct)
    {
        return await File.ReadAllTextAsync(filePath, ct);
    }
}
