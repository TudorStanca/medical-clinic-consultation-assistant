namespace ClinicAssistant.Service.Interfaces;

public interface IDocumentTextExtractor
{
    string SupportedExtension { get; }
    Task<string> ExtractTextAsync(string filePath, CancellationToken ct);
}
