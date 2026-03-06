import { HubConnectionBuilder, LogLevel, type HubConnection } from "@microsoft/signalr";
import { useCallback, useRef } from "react";
import type { SessionStatusEvent, TranscriptSegment } from "./props";

interface UseTranscriptionHubOptions {
  onSegment: (segment: TranscriptSegment) => void;
  onStatus: (event: SessionStatusEvent) => void;
}

const useTranscriptionHub = ({ onSegment, onStatus }: UseTranscriptionHubOptions) => {
  const connectionRef = useRef<HubConnection | null>(null);

  const connect = useCallback(
    async (sessionId: string) => {
      const connection = new HubConnectionBuilder()
        .withUrl("/hubs/transcription")
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      connection.on("TranscriptSegment", (segment: TranscriptSegment) => {
        onSegment(segment);
      });

      connection.on("SessionStatus", (event: SessionStatusEvent) => {
        onStatus(event);
      });

      await connection.start();
      await connection.invoke("JoinSession", sessionId);

      connectionRef.current = connection;
    },
    [onSegment, onStatus]
  );

  const disconnect = useCallback(async (sessionId: string) => {
    const connection = connectionRef.current;
    if (!connection) return;

    try {
      await connection.invoke("LeaveSession", sessionId);
    } finally {
      await connection.stop();
      connectionRef.current = null;
    }
  }, []);

  return { connect, disconnect };
};

export default useTranscriptionHub;
