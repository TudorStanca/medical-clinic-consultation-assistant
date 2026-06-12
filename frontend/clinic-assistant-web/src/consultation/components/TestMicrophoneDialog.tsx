import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { MS_LIGHT } from "@/theme/tokens";

const T = MS_LIGHT;
const SILENCE_THRESHOLD = 5;
const SILENCE_DETECT_DELAY_MS = 2000;

type Permission = "pending" | "granted" | "denied";

interface Props {
  open: boolean;
  onClose: () => void;
}

const TestMicrophoneDialog = ({ open, onClose }: Props) => {
  const [permission, setPermission] = useState<Permission>("pending");
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const [noSoundDetected, setNoSoundDetected] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peakRef = useRef(0);

  const cleanup = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (contextRef.current && contextRef.current.state !== "closed") {
      contextRef.current.close();
      contextRef.current = null;
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const ctx = new AudioContext();
        contextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const buffer = new Uint8Array(analyser.fftSize);
        peakRef.current = 0;
        setPermission("granted");

        silenceTimerRef.current = setTimeout(() => {
          if (peakRef.current < SILENCE_THRESHOLD) {
            setNoSoundDetected(true);
          }
        }, SILENCE_DETECT_DELAY_MS);

        const tick = () => {
          analyser.getByteTimeDomainData(buffer);

          let sum = 0;
          for (const v of buffer) {
            const normalized = (v - 128) / 128;
            sum += normalized * normalized;
          }
          const rms = Math.sqrt(sum / buffer.length);
          const levelPct = Math.min(100, Math.round(rms * 300));

          setLevel(levelPct);
          setPeak((prev) => {
            const next = Math.max(prev, levelPct);
            peakRef.current = next;
            return next;
          });

          rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) {
          setPermission("denied");
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [open]);

  const handleClose = () => {
    cleanup();
    setPermission("pending");
    setLevel(0);
    setPeak(0);
    peakRef.current = 0;
    setNoSoundDetected(false);
    onClose();
  };

  const levelColor =
    level > 60 ? T.success : level > 20 ? T.warm : T.textDim;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <MicIcon sx={{ fontSize: 20, color: T.textMuted }} />
        Testare microfon
      </DialogTitle>

      <DialogContent>
        {permission === "pending" && (
          <Typography sx={{ color: T.textMuted, fontSize: "0.875rem" }}>
            Se solicită acces la microfon...
          </Typography>
        )}

        {permission === "denied" && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningAmberIcon sx={{ color: T.danger, fontSize: 20 }} />
            <Typography sx={{ color: T.danger, fontSize: "0.875rem" }}>
              Acces microfon refuzat. Verifică setările browserului.
            </Typography>
          </Box>
        )}

        {permission === "granted" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "4px" }}>
            <Typography sx={{ color: T.textMuted, fontSize: "0.875rem" }}>
              Vorbește în microfon pentru a testa nivelul audio.
            </Typography>

            <Box>
              <LinearProgress
                variant="determinate"
                value={level}
                sx={{
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: T.surfaceAlt,
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: levelColor,
                    borderRadius: 7,
                    transition: "width 0.05s linear, background-color 0.2s",
                  },
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: "6px" }}>
                <Typography sx={{ fontSize: "0.75rem", color: T.textMuted }}>
                  Nivel curent: <strong>{level}%</strong>
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: T.textMuted }}>
                  Maxim: <strong>{peak}%</strong>
                </Typography>
              </Box>
            </Box>

            {noSoundDetected && peak < SILENCE_THRESHOLD && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  p: "10px 12px",
                  borderRadius: "8px",
                  background: T.warningSoft,
                  border: `1px solid ${T.warning}`,
                }}
              >
                <WarningAmberIcon sx={{ color: T.warning, fontSize: 18, mt: "1px", flexShrink: 0 }} />
                <Typography sx={{ color: T.warning, fontSize: "0.8125rem" }}>
                  Nu se detectează sunet. Verifică dacă microfonul este conectat și activat.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Închide</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestMicrophoneDialog;
