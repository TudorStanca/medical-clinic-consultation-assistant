namespace ClinicAssistant.Service;

public class FileStorageSettings
{
    public required string UploadsPath { get; set; }
    public required string AudioPath { get; set; }
    public required string ModelsPath { get; set; }
    public long MaxUploadFileSizeBytes { get; set; } = 10 * 1024 * 1024;
}
