using ClinicAssistant.Service.Interfaces;

namespace ClinicAssistant.Service;

public class DocumentTextExtractorResolver(IEnumerable<IDocumentTextExtractor> extractors)
{
    private readonly IReadOnlyDictionary<string, IDocumentTextExtractor> _map =
        extractors.ToDictionary(e => e.SupportedExtension, e => e);

    public IDocumentTextExtractor? Resolve(string extension)
    {
        _map.TryGetValue(extension, out var extractor);

        return extractor;
    }
}
