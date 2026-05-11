import { useCallback } from "react";
import useApiClient from "@/core/useApiClient";
import type { UploadedDocumentResponseDTO } from "@/documents/props";
import type { DocumentTypeValue } from "@/shared/types/enums";

const documentUrl = "/api/Documents";

const useDocumentApi = () => {
  const { axios } = useApiClient();

  const uploadDocument = useCallback(
    async (
      file: File,
      patientId: string,
      uploadedByUserId: string,
      documentType: DocumentTypeValue,
      sessionId: string | null
    ): Promise<UploadedDocumentResponseDTO> => {
      const form = new FormData();
      form.append("file", file);
      form.append("patientId", patientId);
      form.append("uploadedByUserId", uploadedByUserId);
      form.append("documentType", String(documentType));
      if (sessionId) {
        form.append("sessionId", sessionId);
      }
      const res = await axios.post<UploadedDocumentResponseDTO>(`${documentUrl}/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    },
    [axios]
  );

  const getDocumentsByPatient = useCallback(
    async (patientId: string): Promise<UploadedDocumentResponseDTO[]> => {
      const res = await axios.get<UploadedDocumentResponseDTO[]>(`${documentUrl}/patient/${patientId}`);

      return res.data;
    },
    [axios]
  );

  const deleteDocument = useCallback(
    async (id: string): Promise<void> => {
      await axios.delete(`${documentUrl}/${id}`);
    },
    [axios]
  );

  const openDocumentFile = useCallback(
    async (id: string): Promise<void> => {
      const res = await axios.get(`${documentUrl}/${id}/file`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank");
    },
    [axios]
  );

  return { uploadDocument, getDocumentsByPatient, deleteDocument, openDocumentFile };
};

export default useDocumentApi;
