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

  const downloadLetterPdf = useCallback(
    async (id: string, fileName: string): Promise<void> => {
      const res = await axios.get(`${letterUrl}/${id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    [axios]
  );

  const previewLetterPdf = useCallback(
    async (id: string): Promise<string> => {
      const res = await axios.get(`${letterUrl}/${id}/pdf`, { responseType: "blob" });

      return URL.createObjectURL(res.data);
    },
    [axios]
  );

  return { createLetter, getLetterBySessionId, updateLetter, downloadLetterPdf, previewLetterPdf };
};

export default useMedicalLetterApi;
