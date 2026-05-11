namespace ClinicAssistant.Domain.DTOs;

public record ChangePasswordRequestDTO(string CurrentPassword, string NewPassword);
