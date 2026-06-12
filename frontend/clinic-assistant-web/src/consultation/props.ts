import type { SessionStatusName } from "@/shared/types/enums";

export interface SessionCreatedResponse {
  sessionId: string;
}

export interface SessionDetailResponse {
  sessionId: string;
  status: SessionStatusName;
  segmentCount: number;
  doctorId: string;
  patientId: string;
  patientFullName: string;
  createdAt: string;
  patientTranscriptAccess: boolean;
}

export interface SessionSummaryResponse {
  sessionId: string;
  status: SessionStatusName;
  createdAt: string;
  doctorId: string;
  doctorFullName: string;
  patientId: string;
  patientFullName: string;
  hasLetter: boolean;
}

export interface TranscriptSegment {
  startMs: number;
  endMs: number;
  text: string;
}

export interface SessionStatusEvent {
  sessionId: string;
  status: SessionStatusName;
}

export interface DashboardStatsResponse {
  weeklyConsultationCount: number;
  totalLetterCount: number;
  averageSessionMinutes: number;
  uniqueCounterpartCount: number;
}
