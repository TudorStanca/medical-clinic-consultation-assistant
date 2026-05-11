import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useBlocker } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useConsultationApi from "@/consultation/useConsultationApi";
import useAudioWebSocket from "@/consultation/useAudioWebSocket";
import useTranscriptionHub from "@/consultation/useTranscriptionHub";
import TranscriptView from "@/consultation/components/TranscriptView";
import RecordingControls from "@/consultation/components/RecordingControls";
import DocumentsPanel from "@/documents/components/DocumentsPanel";
import GenerateLetterDialog from "@/medicalLetter/components/GenerateLetterDialog";
import MedicalLetterForm from "@/medicalLetter/components/MedicalLetterForm";
import useMedicalLetterApi from "@/medicalLetter/useMedicalLetterApi";
import { extractErrorMessages } from "@/core/errorMessages";
import useNotification from "@/shared/NotificationContext";
import useAuth from "@/auth/useAuth";
import { useRecording } from "@/consultation/RecordingContext";
import { Roles } from "@/shared/types/enums";
import type { SessionStatusName } from "@/shared/types/enums";
import type { TranscriptSegment, SessionStatusEvent } from "@/consultation/props";
import type { MedicalLetterResponseDTO } from "@/medicalLetter/props";

const ConsultationPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { getSessionById, getTranscript, patchStatus } = useConsultationApi();
  const { getLetterBySessionId } = useMedicalLetterApi();
  const { startStreaming, stopStreaming, pauseStreaming, resumeStreaming } = useAudioWebSocket();
  const { hasRole } = useAuth();

  const [status, setStatus] = useState<SessionStatusName>("Created");
  const [patientId, setPatientId] = useState<string>("");
  const [patientFullName, setPatientFullName] = useState<string>("");
  const [sessionCreatedAt, setSessionCreatedAt] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [letter, setLetter] = useState<MedicalLetterResponseDTO | null>(null);
  const [letterLoaded, setLetterLoaded] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const notify = useNotification();
  const [loading, setLoading] = useState(true);

  const isDoctor = hasRole(Roles.Doctor);
  const isActive = recording || paused;

  const { setIsActive: setGlobalIsActive } = useRecording();
  const isActiveRef = useRef(false);
  isActiveRef.current = isActive;

  useEffect(() => {
    setGlobalIsActive(isActive);
  }, [isActive, setGlobalIsActive]);

  useEffect(() => {
    return () => {
      setGlobalIsActive(false);
      if (isActiveRef.current) {
        stopStreaming();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blocker = useBlocker(isActive);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);

    return () => window.removeEventListener("beforeunload", handler);
  }, [isActive]);

  const handleSegment = useCallback((segment: TranscriptSegment) => {
    setSegments((prev) => [...prev, segment]);
    setIsPreview(true);
  }, []);

  const handleStatus = useCallback(
    async (event: SessionStatusEvent) => {
      setStatus(event.status);
      if ((event.status === "Done" || event.status === "Failed") && sessionId) {
        disconnect(sessionId);
        setRecording(false);
        setPaused(false);
        if (event.status === "Done") {
          try {
            const canonical = await getTranscript(sessionId);
            setSegments(canonical);
            setIsPreview(false);
          } catch {
            // keep preview on error
          }
          try {
            const existingLetter = await getLetterBySessionId(sessionId);
            setLetter(existingLetter);
            setLetterLoaded(true);
          } catch {
            setLetterLoaded(true);
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionId, getTranscript, getLetterBySessionId]
  );

  const { connect, disconnect } = useTranscriptionHub({
    onSegment: handleSegment,
    onStatus: handleStatus,
  });

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    const init = async () => {
      setLoading(true);
      try {
        const session = await getSessionById(sessionId);
        setStatus(session.status);
        setPatientId(session.patientId);
        setPatientFullName(session.patientFullName);
        setSessionCreatedAt(session.createdAt);

        if (session.status === "Done" || session.status === "Failed") {
          if (session.segmentCount > 0) {
            const segs = await getTranscript(sessionId);
            setSegments(segs);
            setIsPreview(false);
          }
          const existingLetter = await getLetterBySessionId(sessionId);
          setLetter(existingLetter);
          setLetterLoaded(true);
        }
      } catch (err) {
        extractErrorMessages(err).forEach((m) => notify(m, "error"));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [sessionId, getSessionById, getTranscript, getLetterBySessionId, notify]);

  const handleStart = async () => {
    if (!sessionId) {
      return;
    }
    try {
      await connect(sessionId);
      await startStreaming(sessionId);
      await patchStatus(sessionId, "Recording");
      setStatus("Recording");
      setRecording(true);
      setIsPreview(true);
    } catch (err) {
      extractErrorMessages(err).forEach((m) => notify(m, "error"));
    }
  };

  const handlePause = async () => {
    await pauseStreaming();
    setPaused(true);
  };

  const handleResume = async () => {
    await resumeStreaming();
    setPaused(false);
  };

  const handleStop = () => {
    stopStreaming();
    setRecording(false);
    setPaused(false);
    setStatus("Processing");
  };

  const handleLetterGenerated = (generated: MedicalLetterResponseDTO) => {
    setLetter(generated);
    setLetterLoaded(true);
    setGenerateOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/consultations")}
        sx={{ mb: 1 }}
      >
        Listă consultații
      </Button>
      <Typography variant="h6" mb={2}>
        {patientFullName
          ? `Consultație — ${patientFullName} — ${new Date(sessionCreatedAt).toLocaleDateString("ro-RO")}`
          : `Consultație — ${sessionId}`}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2 }}>
            {isDoctor && (
              <RecordingControls
                status={status}
                recording={recording}
                paused={paused}
                onStart={handleStart}
                onStop={handleStop}
                onPause={handlePause}
                onResume={handleResume}
              />
            )}
            <TranscriptView segments={segments} isPreview={isPreview} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          {patientId && (
            <DocumentsPanel patientId={patientId} sessionId={sessionId ?? null} readOnly={!isDoctor} />
          )}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" mb={1}>
              Scrisoare medicală
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {!letterLoaded && status !== "Done" ? (
              <Typography variant="body2" color="text.secondary">
                Disponibil după finalizarea sesiunii.
              </Typography>
            ) : !letter && status === "Done" && isDoctor ? (
              <Button
                variant="contained"
                startIcon={<AutoFixHighIcon />}
                onClick={() => setGenerateOpen(true)}
              >
                Generează scrisoare
              </Button>
            ) : letter ? (
              <MedicalLetterForm
                letter={letter}
                readOnly={!isDoctor}
                onSaved={(updated) => setLetter(updated)}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nicio scrisoare medicală.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      {sessionId && (
        <GenerateLetterDialog
          open={generateOpen}
          sessionId={sessionId}
          onGenerated={handleLetterGenerated}
          onClose={() => setGenerateOpen(false)}
        />
      )}
      <Dialog open={blocker.state === "blocked"}>
        <DialogTitle>Ieși din înregistrare?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Dacă ieși acum, înregistrarea se oprește și consultația va fi salvată cu ce s-a înregistrat până atunci.
            Continui?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => blocker.reset?.()}>Anulează</Button>
          <Button color="error" onClick={() => blocker.proceed?.()}>
            Continuă
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsultationPage;
