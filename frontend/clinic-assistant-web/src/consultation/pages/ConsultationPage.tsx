import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Chip, Paper, Typography } from "@mui/material";
import useTranscriptionApi from "../useTranscriptionApi";
import useTranscriptionHub from "../useTranscriptionHub";
import useAudioWebSocket from "../useAudioWebSocket";
import type { SessionStatusEvent, TranscriptSegment } from "../props";

const formatMs = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

const ConsultationPage = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<string>("Idle");
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  const { createSession } = useTranscriptionApi();
  const { startStreaming, stopStreaming } = useAudioWebSocket();

  const handleSegment = useCallback((segment: TranscriptSegment) => {
    setSegments((prev) => [...prev, segment]);
  }, []);

  const handleStatus = useCallback(
    (event: SessionStatusEvent) => {
      setStatus(event.status);
      if ((event.status === "Done" || event.status === "Failed") && sessionId) {
        disconnect(sessionId);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionId]
  );

  const { connect, disconnect } = useTranscriptionHub({
    onSegment: handleSegment,
    onStatus: handleStatus,
  });

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [segments]);

  const handleStart = async () => {
    const { sessionId: id } = await createSession();
    setSessionId(id);
    setSegments([]);
    setStatus("Recording");

    await connect(id);
    await startStreaming(id);

    setRecording(true);
  };

  const handleStop = () => {
    stopStreaming();
    setRecording(false);
    setStatus("Transcribing");
    // Backend finalizes async; SignalR will push status "Done"/"Failed"
    // disconnect happens in handleStatus when Done/Failed arrives
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 700, width: "100%" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Consultation Recording
        </Typography>
        {sessionId && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Session: {sessionId}
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Chip
            label={`Status: ${status}`}
            variant="outlined"
            color={
              recording ? "error" : status === "Done" ? "success" : status === "Transcribing" ? "warning" : "default"
            }
          />
          {recording && (
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "error.main",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.2 },
                },
                animation: "pulse 1.2s ease-in-out infinite",
              }}
            />
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={recording}
            onClick={handleStart}
            sx={{ minWidth: 160 }}
          >
            Start Recording
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            disabled={!recording}
            onClick={handleStop}
            sx={{ minWidth: 160 }}
          >
            Stop Recording
          </Button>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            minHeight: 200,
            maxHeight: 400,
            overflowY: "auto",
            p: 2,
            fontFamily: "monospace",
            fontSize: 14,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {segments.length === 0 ? (
            <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
              Transcript will appear here...
            </Typography>
          ) : (
            segments.map((seg, i) => (
              <Box key={i} sx={{ mb: 0.5 }}>
                [{formatMs(seg.startMs)}] {seg.text}
              </Box>
            ))
          )}
          <div ref={transcriptEndRef} />
        </Paper>
      </Paper>
    </Box>
  );
};

export default ConsultationPage;
