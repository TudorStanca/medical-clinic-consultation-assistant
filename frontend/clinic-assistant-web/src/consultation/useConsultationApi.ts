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
import type { PagedQuery, PagedResponse } from "@/shared/types/api";

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

  return { createSession, getSessionById, getTranscript, patchStatus, getSessionsPaged, deleteSession };
};

export default useConsultationApi;
