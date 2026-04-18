import { useCallback } from "react";
import useApiClient from "@/core/useApiClient";
import type {
  SessionCreatedResponse,
  SessionDetailResponse,
  SessionSummaryResponse,
  TranscriptSegment,
} from "@/consultation/props";
import type { SessionStatusName } from "@/shared/types/enums";
import { SessionStatus } from "@/shared/types/enums";

const sessionUrl = "/api/ConsultationSessions";

const useConsultationApi = () => {
  const { axios } = useApiClient();

  const createSession = useCallback(
    async (doctorId: string, patientId: string): Promise<SessionCreatedResponse> => {
      const res = await axios.post<SessionCreatedResponse>(sessionUrl, { doctorId, patientId });

      return res.data;
    },
    [axios]
  );

  const getSessionById = useCallback(
    async (sessionId: string): Promise<SessionDetailResponse> => {
      const res = await axios.get<SessionDetailResponse>(`${sessionUrl}/${sessionId}`);

      return res.data;
    },
    [axios]
  );

  const getTranscript = useCallback(
    async (sessionId: string): Promise<TranscriptSegment[]> => {
      const res = await axios.get<TranscriptSegment[]>(`${sessionUrl}/${sessionId}/transcript`);

      return res.data;
    },
    [axios]
  );

  const getMySessions = useCallback(async (): Promise<SessionSummaryResponse[]> => {
    const res = await axios.get<SessionSummaryResponse[]>(sessionUrl);

    return res.data;
  }, [axios]);

  const patchStatus = useCallback(
    async (sessionId: string, status: SessionStatusName): Promise<void> => {
      await axios.patch(`${sessionUrl}/${sessionId}/status`, { status: SessionStatus[status] });
    },
    [axios]
  );

  return { createSession, getSessionById, getTranscript, getMySessions, patchStatus };
};

export default useConsultationApi;
