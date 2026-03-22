namespace ClinicAssistant.Domain.DTOs;

public record LoginResponseDTO(string Token, string UserId, string Email, IEnumerable<string> Roles);
