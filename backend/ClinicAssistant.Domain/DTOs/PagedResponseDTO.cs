namespace ClinicAssistant.Domain.DTOs;

public record PagedResponseDTO<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int Page,
    int PageSize);
