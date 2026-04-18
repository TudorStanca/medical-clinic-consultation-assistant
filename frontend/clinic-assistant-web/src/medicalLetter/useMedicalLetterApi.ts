import { useCallback } from "react";
import useApiClient from "@/core/useApiClient";
import type { MedicalLetterPostDTO, MedicalLetterPutDTO, MedicalLetterResponseDTO } from "@/medicalLetter/props";

const letterUrl = "/api/MedicalLetters";

const useMedicalLetterApi = () => {
  const { axios } = useApiClient();

  const createLetter = useCallback(
    async (dto: MedicalLetterPostDTO): Promise<MedicalLetterResponseDTO> => {
      const res = await axios.post<MedicalLetterResponseDTO>(letterUrl, dto);

      return res.data;
    },
    [axios]
  );

  const getLetterBySessionId = useCallback(
    async (sessionId: string): Promise<MedicalLetterResponseDTO | null> => {
      try {
        const res = await axios.get<MedicalLetterResponseDTO>(`${letterUrl}/session/${sessionId}`);

        return res.data;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status: number } };
        if (axiosErr.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    [axios]
  );

  const updateLetter = useCallback(
    async (id: string, dto: MedicalLetterPutDTO): Promise<MedicalLetterResponseDTO> => {
      const res = await axios.put<MedicalLetterResponseDTO>(`${letterUrl}/${id}`, dto);

      return res.data;
    },
    [axios]
  );

  return { createLetter, getLetterBySessionId, updateLetter };
};

export default useMedicalLetterApi;
