import type { DoctorResponseDTO } from "@/doctors/props";
import type { PatientResponseDTO } from "@/patients/props";
import type { UploadedDocumentResponseDTO } from "@/documents/props";

export interface LetterAttachmentResponseDTO {
  id: string;
  medicalLetterId: string;
  originalFileName: string;
  contentType: string;
  caption: string | null;
  uploadedByUserId: string;
  uploadedAt: string;
}

export interface MedicalLetterSummary {
  id: string;
  letterType: string;
  location: string;
  writtenAt: string;
}

export interface MedicalLetterPostDTO {
  sessionId: string;
  letterType: string;
  location: string;
  includeAllPatientDocuments: boolean;
  previousLetterIds?: string[];
}

export interface MedicalLetterPutDTO {
  antecedente: string | null;
  simptome: string | null;
  clinice: string | null;
  paraclinice: string | null;
  diagnostic: string | null;
  recomandari: string | null;
  location: string;
}

export interface MedicalLetterResponseDTO {
  id: string;
  sessionId: string;
  letterType: string;
  location: string;
  writtenAt: string;
  lastEditedAt: string | null;
  antecedente: string | null;
  simptome: string | null;
  clinice: string | null;
  paraclinice: string | null;
  diagnostic: string | null;
  recomandari: string | null;
  doctor: DoctorResponseDTO;
  patient: PatientResponseDTO;
  documents: UploadedDocumentResponseDTO[];
}
