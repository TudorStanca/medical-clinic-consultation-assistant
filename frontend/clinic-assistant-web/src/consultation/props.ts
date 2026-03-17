export interface SessionCreatedResponse {
  sessionId: string;
}

export interface TranscriptSegment {
  startMs: number;
  endMs: number;
  text: string;
}

export interface SessionStatusEvent {
  sessionId: string;
  status: string;
}
