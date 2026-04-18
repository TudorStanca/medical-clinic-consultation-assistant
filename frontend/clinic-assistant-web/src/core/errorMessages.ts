import type { AxiosError } from "axios";
import type { ValidationErrorResponse, CustomErrorResponse } from "@/shared/types/api";

export function extractErrorMessages(error: unknown): string[] {
  const axiosError = error as AxiosError;
  if (!axiosError.response) {
    return ["Serverul nu răspunde. Verificați conexiunea."];
  }

  const data = axiosError.response.data as ValidationErrorResponse & CustomErrorResponse;
  const status = axiosError.response.status;

  if (status === 422 && Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors;
  }

  if (data?.description) {
    return [data.description];
  }

  if (data?.message) {
    return [data.message];
  }

  if (status === 401) return ["Sesiunea a expirat. Vă rugăm să vă autentificați din nou."];
  if (status === 403) return ["Nu aveți permisiunea să efectuați această acțiune."];
  if (status === 404) return ["Resursa solicitată nu a fost găsită."];

  return [`Eroare neașteptată (${status}).`];
}
