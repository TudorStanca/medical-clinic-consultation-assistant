using ClinicAssistant.Service.Interfaces;
using UglyToad.PdfPig;

namespace ClinicAssistant.Service;

public class PdfDocumentTextExtractor : IDocumentTextExtractor
{
    public string SupportedExtension => ".pdf";

    public Task<string> ExtractTextAsync(string filePath, CancellationToken ct)
    {
        using var document = PdfDocument.Open(filePath);
        var text = string.Join("\n", document.GetPages().Select(p => p.Text));

        return Task.FromResult(text);
    }
}
