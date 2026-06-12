export interface UploadedDocumentResponseDTO {
  id: string;
  patientId: string;
  sessionId: string | null;
  originalFileName: string;
  uploadedAt: string;
  documentType: string;
  uploadedByUserId: string;
}
