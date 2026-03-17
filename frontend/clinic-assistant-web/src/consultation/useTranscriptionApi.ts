import { useCallback } from "react";
import useApiClient from "@/core/useApiClient";
import type { SessionCreatedResponse } from "./props";

const transcriptionUrl = "/api/Transcription";

const useTranscriptionApi = () => {
  const { axios } = useApiClient();

  const createSession = useCallback(async (): Promise<SessionCreatedResponse> => {
    const response = await axios.post<SessionCreatedResponse>(transcriptionUrl);
    return response.data;
  }, [axios]);

  return { createSession };
};

export default useTranscriptionApi;
