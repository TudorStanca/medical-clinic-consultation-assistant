import axios from "axios";
import type { AxiosError } from "axios";
import type { ValidationErrorResponse, CustomErrorResponse } from "@/shared/types/api";

export function isNetworkError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }
  if (!error.response || error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
    return true;
  }
  const status = error.response.status;

  return status === 500 || status === 502 || status === 503 || status === 504;
}

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

  if (status === 401) {
    if (axiosError.config?.url?.endsWith("/api/auth/login")) {
      return ["Email sau parolă incorecte."];
    }

    return ["Sesiunea a expirat. Vă rugăm să vă autentificați din nou."];
  }
  if (status === 403) return ["Nu aveți permisiunea să efectuați această acțiune."];
  if (status === 404) return ["Resursa solicitată nu a fost găsită."];

  return [`Eroare neașteptată (${status}).`];
}
