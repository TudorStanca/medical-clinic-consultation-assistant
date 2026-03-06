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

  const uploadChunk = useCallback(
    async (sessionId: string, blob: Blob): Promise<void> => {
      const formData = new FormData();
      formData.append("chunk", blob, `chunk_${Date.now()}.webm`);
      await axios.post(`${transcriptionUrl}/${sessionId}/chunks`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    [axios]
  );

  const stopSession = useCallback(
    async (sessionId: string): Promise<void> => {
      await axios.post(`${transcriptionUrl}/${sessionId}/stop`);
    },
    [axios]
  );

  return { createSession, uploadChunk, stopSession };
};

export default useTranscriptionApi;
