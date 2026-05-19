import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useBlocker } from "react-router-dom";
import axios from "axios";
import type { ReactNode } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Skeleton,
  Switch,
  Typography,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import useConsultationApi from "@/consultation/useConsultationApi";
import useAudioWebSocket from "@/consultation/useAudioWebSocket";
import useTranscriptionHub from "@/consultation/useTranscriptionHub";
import TranscriptView from "@/consultation/components/TranscriptView";
import RecordingControls from "@/consultation/components/RecordingControls";
import TestMicrophoneDialog from "@/consultation/components/TestMicrophoneDialog";
import DocumentsPanel from "@/documents/components/DocumentsPanel";
import GenerateLetterDialog from "@/medicalLetter/components/GenerateLetterDialog";
import MedicalLetterForm from "@/medicalLetter/components/MedicalLetterForm";
import useMedicalLetterApi from "@/medicalLetter/useMedicalLetterApi";
import { extractErrorMessages } from "@/core/errorMessages";
import useNotification from "@/shared/NotificationContext";
import useAuth from "@/auth/useAuth";
import { useRecording } from "@/consultation/RecordingContext";
import { usePageHeader } from "@/shared/PageHeaderContext";
import { Roles } from "@/shared/types/enums";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";
import type { SessionStatusName } from "@/shared/types/enums";
import type { TranscriptSegment, SessionStatusEvent } from "@/consultation/props";
import type { MedicalLetterResponseDTO } from "@/medicalLetter/props";

const T = MS_LIGHT;

const cardSx = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: "14px",
  p: "20px",
} as const;

const SectionLabel = ({ children }: { children: string }) => (
  <Typography
    sx={{
      fontSize: "0.6875rem",
      fontWeight: 600,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      color: T.textDim,
      fontFamily: MS_FONTS.sans,
      mb: "12px",
    }}
  >
    {children}
  </Typography>
);

const TimelineEntry = ({
  icon,
  label,
  time,
}: {
  icon: "done" | "empty";
  label: string;
  time?: string;
}) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
    {icon === "done" ? (
      <CheckCircleOutlineIcon sx={{ fontSize: 18, color: T.success, mt: "2px", flexShrink: 0 }} />
    ) : (
      <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: T.textDim, mt: "2px", flexShrink: 0 }} />
    )}
    <Box>
      <Typography sx={{ fontSize: "0.8125rem", color: T.text, fontFamily: MS_FONTS.sans }}>
        {label}
      </Typography>
      {time && (
        <Typography sx={{ fontFamily: MS_FONTS.mono, fontSize: "0.75rem", color: T.textMuted }}>
          {time}
        </Typography>
      )}
    </Box>
  </Box>
);

const Card = ({ children, sx }: { children: ReactNode; sx?: object }) => (
  <Box sx={{ ...cardSx, ...sx }}>{children}</Box>
);

const ConsultationPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { getSessionById, getTranscript, patchStatus, setTranscriptAccess } = useConsultationApi();
  const { getLetterBySessionId } = useMedicalLetterApi();
  const { startStreaming, stopStreaming, pauseStreaming, resumeStreaming } = useAudioWebSocket();
  const { hasRole, user } = useAuth();
  const { setHeader } = usePageHeader();

  const [status, setStatus] = useState<SessionStatusName>("Created");
  const [doctorId, setDoctorId] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [patientFullName, setPatientFullName] = useState<string>("");
  const [patientTranscriptAccess, setPatientTranscriptAccess] = useState(false);
  const [sessionCreatedAt, setSessionCreatedAt] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [letter, setLetter] = useState<MedicalLetterResponseDTO | null>(null);
  const [letterLoaded, setLetterLoaded] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [testMicOpen, setTestMicOpen] = useState(false);
  const notify = useNotification();
  const [loading, setLoading] = useState(true);

  const isDoctor = hasRole(Roles.Doctor);
  const isSessionDoctor = isDoctor && user?.id === doctorId;
  const isActive = recording || paused;
  const isDone = status === "Done" && !recording && !paused;

  const { setIsActive: setGlobalIsActive } = useRecording();
  const isActiveRef = useRef(false);
  isActiveRef.current = isActive;

  useEffect(() => {
    if (patientFullName) {
      setHeader({
        title: patientFullName,
        subtitle: sessionCreatedAt
          ? new Date(sessionCreatedAt).toLocaleDateString("ro-RO", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : undefined,
        breadcrumbs: ["Consultații", patientFullName],
      });
    } else {
      setHeader({ title: "Consultație", breadcrumbs: ["Consultații"] });
    }

    return () => setHeader({ title: "" });
  }, [patientFullName, sessionCreatedAt, setHeader]);

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
        let session;
        try {
          session = await getSessionById(sessionId);
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.status === 403) {
            navigate("/403");
            return;
          }
          throw err;
        }

        setStatus(session.status);
        setDoctorId(session.doctorId);
        setPatientId(session.patientId);
        setPatientFullName(session.patientFullName);
        setSessionCreatedAt(session.createdAt);
        setPatientTranscriptAccess(session.patientTranscriptAccess);

        if (session.status === "Done" || session.status === "Failed") {
          if (session.segmentCount > 0 && (!hasRole(Roles.Patient) || session.patientTranscriptAccess)) {
            const segs = await getTranscript(sessionId);
            setSegments(segs);
            setIsPreview(false);
          }
          try {
            const existingLetter = await getLetterBySessionId(sessionId);
            setLetter(existingLetter);
          } catch {
            // pacientul poate să nu aibă acces la scrisoare
          }
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

  const handleDownloadTranscript = () => {
    const lines = segments.map((s) => {
      const h = Math.floor(s.startMs / 3600000);
      const m = Math.floor((s.startMs % 3600000) / 60000);
      const sec = Math.floor((s.startMs % 60000) / 1000);
      const ts = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
      return `[${ts}] ${s.text}`;
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${sessionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTranscriptAccessToggle = async (allow: boolean) => {
    try {
      await setTranscriptAccess(sessionId!, allow);
      setPatientTranscriptAccess(allow);
    } catch (err) {
      extractErrorMessages(err).forEach((m) => notify(m, "error"));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const patientCard = (
    <Card>
      <SectionLabel>Pacient</SectionLabel>
      <Typography sx={{ fontWeight: 600, color: T.text, fontSize: "0.9375rem" }}>
        {patientFullName || "—"}
      </Typography>
      {sessionCreatedAt && (
        <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted, mt: "4px" }}>
          {new Date(sessionCreatedAt).toLocaleDateString("ro-RO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Typography>
      )}
    </Card>
  );

  return (
    <>
      <Button
        size="small"
        startIcon={<ArrowBackIcon sx={{ fontSize: "16px !important" }} />}
        onClick={() => navigate("/consultations")}
        sx={{
          color: T.textMuted,
          fontFamily: MS_FONTS.sans,
          fontSize: "0.8125rem",
          mb: "20px",
          px: "6px",
          "&:hover": { color: T.text, background: T.surfaceAlt },
        }}
      >
        Listă consultații
      </Button>

      {isDone ? (
        /* ─── DONE LAYOUT ─── */
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "300px 1fr" },
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Left: patient info + timeline */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {patientCard}
            <Card>
              <SectionLabel>Cronologie</SectionLabel>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <TimelineEntry
                  icon="done"
                  label="Consultație creată"
                  time={
                    sessionCreatedAt
                      ? new Date(sessionCreatedAt).toLocaleTimeString("ro-RO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : undefined
                  }
                />
                <TimelineEntry icon="done" label="Înregistrare finalizată" />
                {letter ? (
                  <TimelineEntry
                    icon="done"
                    label="Scrisoare generată"
                    time={new Date(letter.writtenAt).toLocaleTimeString("ro-RO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                ) : (
                  <TimelineEntry icon="empty" label="Scrisoare necompletă" />
                )}
              </Box>
            </Card>
            {patientId && (
              <DocumentsPanel
                patientId={patientId}
                sessionId={sessionId ?? null}
                readOnly={!isDoctor}
              />
            )}
          </Box>

          {/* Right: transcript + letter editor or generate CTA */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {segments.length > 0 && (isDoctor || patientTranscriptAccess) && (
              <Card>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px" }}>
                  <SectionLabel>Transcriere</SectionLabel>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {(isSessionDoctor || patientTranscriptAccess) && (
                      <Button
                        size="small"
                        startIcon={<DownloadIcon sx={{ fontSize: "16px !important" }} />}
                        onClick={handleDownloadTranscript}
                        sx={{
                          color: T.textMuted,
                          fontSize: "0.8125rem",
                          fontFamily: MS_FONTS.sans,
                          "&:hover": { color: T.text, background: T.surfaceAlt },
                        }}
                      >
                        Descarcă .txt
                      </Button>
                    )}
                    {isSessionDoctor && (
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={patientTranscriptAccess}
                            onChange={(e) => handleTranscriptAccessToggle(e.target.checked)}
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted, fontFamily: MS_FONTS.sans }}>
                            Acces pacient
                          </Typography>
                        }
                        sx={{ mr: 0 }}
                      />
                    )}
                  </Box>
                </Box>
                <TranscriptView segments={segments} isPreview={false} />
              </Card>
            )}
            {!letterLoaded ? (
              <Card>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              </Card>
            ) : letter ? (
              <Card>
                <MedicalLetterForm
                  letter={letter}
                  readOnly={!isSessionDoctor}
                  onSaved={(updated) => setLetter(updated)}
                />
              </Card>
            ) : isSessionDoctor ? (
              <Card>
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography
                    sx={{
                      fontFamily: MS_FONTS.serif,
                      fontSize: "1.25rem",
                      color: T.text,
                      mb: "8px",
                    }}
                  >
                    Nicio scrisoare medicală
                  </Typography>
                  <Typography sx={{ fontSize: "0.875rem", color: T.textMuted, mb: "24px" }}>
                    Transcrierea este gata. Generați o scrisoare medicală din transcriere.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AutoFixHighIcon />}
                    onClick={() => setGenerateOpen(true)}
                  >
                    Generează scrisoare
                  </Button>
                </Box>
              </Card>
            ) : (
              <Card>
                <Typography sx={{ color: T.textMuted, fontSize: "0.875rem" }}>
                  Nicio scrisoare medicală disponibilă.
                </Typography>
              </Card>
            )}
          </Box>
        </Box>
      ) : (
        /* ─── RECORDING LAYOUT ─── */
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.15fr 1fr" },
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Left: recording controls + transcript */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {isSessionDoctor && (
              <Card>
                <RecordingControls
                  status={status}
                  recording={recording}
                  paused={paused}
                  onStart={handleStart}
                  onStop={handleStop}
                  onPause={handlePause}
                  onResume={handleResume}
                  onTestMic={() => setTestMicOpen(true)}
                />
              </Card>
            )}
            <Card>
              <TranscriptView segments={segments} isPreview={isPreview} />
            </Card>
          </Box>

          {/* Right: patient info + documents */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {patientCard}
            {patientId && (
              <DocumentsPanel
                patientId={patientId}
                sessionId={sessionId ?? null}
                readOnly={!isDoctor}
              />
            )}
            {status === "Processing" && (
              <Card>
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <CircularProgress size={20} />
                  <Typography sx={{ fontSize: "0.875rem", color: T.textMuted }}>
                    Se procesează înregistrarea…
                  </Typography>
                </Box>
              </Card>
            )}
          </Box>
        </Box>
      )}

      {sessionId && (
        <GenerateLetterDialog
          open={generateOpen}
          sessionId={sessionId}
          patientId={patientId}
          onGenerated={handleLetterGenerated}
          onClose={() => setGenerateOpen(false)}
        />
      )}

      <TestMicrophoneDialog open={testMicOpen} onClose={() => setTestMicOpen(false)} />

      <Dialog open={blocker.state === "blocked"}>
        <DialogTitle>Ieși din înregistrare?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Dacă ieși acum, înregistrarea se oprește și consultația va fi salvată cu ce s-a înregistrat până
            atunci. Continui?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => blocker.reset?.()}>Anulează</Button>
          <Button color="error" onClick={() => blocker.proceed?.()}>
            Continuă
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConsultationPage;
