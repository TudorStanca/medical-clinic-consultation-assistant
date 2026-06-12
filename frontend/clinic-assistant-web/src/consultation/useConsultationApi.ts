import { useCallback } from "react";
import useApiClient from "@/core/useApiClient";
import type {
  SessionCreatedResponse,
  SessionDetailResponse,
  SessionSummaryResponse,
  TranscriptSegment,
  DashboardStatsResponse,
} from "@/consultation/props";
import type { SessionStatusName } from "@/shared/types/enums";
import { SessionStatus } from "@/shared/types/enums";
import type { PagedQuery, PagedResponse } from "@/shared/types/api";

const sessionUrl = "/api/ConsultationSessions";

const useConsultationApi = () => {
  const { axios } = useApiClient();

  const createSession = useCallback(
    async (patientId: string): Promise<SessionCreatedResponse> => {
      const res = await axios.post<SessionCreatedResponse>(sessionUrl, { patientId });

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

  const patchStatus = useCallback(
    async (sessionId: string, status: SessionStatusName): Promise<void> => {
      await axios.patch(`${sessionUrl}/${sessionId}/status`, { status: SessionStatus[status] });
    },
    [axios]
  );

  const getSessionsPaged = useCallback(
    async (query: PagedQuery): Promise<PagedResponse<SessionSummaryResponse>> => {
      const res = await axios.get<PagedResponse<SessionSummaryResponse>>(sessionUrl, {
        params: query,
      });

      return res.data;
    },
    [axios]
  );

  const deleteSession = useCallback(
    async (sessionId: string): Promise<void> => {
      await axios.delete(`${sessionUrl}/${sessionId}`);
    },
    [axios]
  );

  const getDashboardStats = useCallback(async (): Promise<DashboardStatsResponse> => {
    const res = await axios.get<DashboardStatsResponse>(`${sessionUrl}/stats`);

    return res.data;
  }, [axios]);

  const setTranscriptAccess = useCallback(
    async (sessionId: string, allow: boolean): Promise<void> => {
      await axios.patch(`${sessionUrl}/${sessionId}/transcript-access`, { allow });
    },
    [axios]
  );

  return { createSession, getSessionById, getTranscript, patchStatus, getSessionsPaged, deleteSession, getDashboardStats, setTranscriptAccess };
};

export default useConsultationApi;
