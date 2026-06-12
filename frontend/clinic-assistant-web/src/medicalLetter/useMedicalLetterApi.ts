import { useCallback } from "react";
import useApiClient from "@/core/useApiClient";
import type { LetterAttachmentResponseDTO, MedicalLetterPostDTO, MedicalLetterPutDTO, MedicalLetterResponseDTO, MedicalLetterSummary } from "@/medicalLetter/props";

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

  const getPreviousLetters = useCallback(
    async (patientId: string, excludeSessionId?: string): Promise<MedicalLetterSummary[]> => {
      const params: Record<string, string> = { patientId };
      if (excludeSessionId) {
        params.excludeSessionId = excludeSessionId;
      }
      const res = await axios.get<MedicalLetterSummary[]>(`${letterUrl}/previous`, { params });

      return res.data;
    },
    [axios]
  );

  const addAttachment = useCallback(
    async (letterId: string, file: File, caption: string): Promise<LetterAttachmentResponseDTO> => {
      const form = new FormData();
      form.append("file", file);
      if (caption) {
        form.append("caption", caption);
      }
      const res = await axios.post<LetterAttachmentResponseDTO>(`${letterUrl}/${letterId}/attachments`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    },
    [axios]
  );

  const getAttachments = useCallback(
    async (letterId: string): Promise<LetterAttachmentResponseDTO[]> => {
      const res = await axios.get<LetterAttachmentResponseDTO[]>(`${letterUrl}/${letterId}/attachments`);

      return res.data;
    },
    [axios]
  );

  const getAttachmentImageUrl = useCallback(
    async (letterId: string, attachmentId: string): Promise<string> => {
      const res = await axios.get(`${letterUrl}/${letterId}/attachments/${attachmentId}/image`, { responseType: "blob" });

      return URL.createObjectURL(res.data);
    },
    [axios]
  );

  const deleteAttachment = useCallback(
    async (letterId: string, attachmentId: string): Promise<void> => {
      await axios.delete(`${letterUrl}/${letterId}/attachments/${attachmentId}`);
    },
    [axios]
  );

  return { createLetter, getPreviousLetters, getLetterBySessionId, updateLetter, downloadLetterPdf, previewLetterPdf, addAttachment, getAttachments, getAttachmentImageUrl, deleteAttachment };
};

export default useMedicalLetterApi;
