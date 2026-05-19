import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import SettingsVoiceIcon from "@mui/icons-material/SettingsVoice";
import type { SessionStatusName } from "@/shared/types/enums";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";

const T = MS_LIGHT;
const BARS = 40;

const formatSecs = (s: number): string => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const hStr = h > 0 ? `${String(h).padStart(2, "0")}:` : "";

  return `${hStr}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

interface Props {
  status: SessionStatusName;
  recording: boolean;
  paused: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onTestMic: () => void;
}

const RecordingControls = ({ status, recording, paused, onStart, onStop, onPause, onResume, onTestMic }: Props) => {
  const isTerminal =
    status === "Done" || status === "Failed" || status === "Interrupted" || status === "Processing";
  const isActive = recording || paused;

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (recording && !paused) {
      const id = setInterval(() => setElapsed((s) => s + 1), 1000);

      return () => clearInterval(id);
    }
    if (!recording) {
      setElapsed(0);
    }
  }, [recording, paused]);

  const chipLabel = paused
    ? "PE PAUZĂ"
    : status === "Recording"
    ? "SE ÎNREGISTREAZĂ"
    : status === "Processing"
    ? "SE PROCESEAZĂ"
    : status === "Done"
    ? "FINALIZAT"
    : status === "Failed"
    ? "EROARE"
    : "INIȚIALIZAT";

  const chipFg = paused
    ? T.warning
    : status === "Recording"
    ? T.recording
    : status === "Processing"
    ? T.warm
    : status === "Done"
    ? T.success
    : status === "Failed"
    ? T.danger
    : T.textDim;

  const chipBg = paused
    ? T.warningSoft
    : status === "Recording"
    ? "oklch(0.96 0.050 25)"
    : status === "Processing"
    ? T.warmSoft
    : status === "Done"
    ? T.successSoft
    : status === "Failed"
    ? T.dangerSoft
    : T.surfaceAlt;

  const ringColor = paused ? T.warning : status === "Recording" ? T.recording : T.border;
  const micColor = paused ? T.warning : status === "Recording" ? T.recording : T.textDim;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Status chip + timer */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            px: "10px",
            py: "5px",
            borderRadius: "999px",
            background: chipBg,
            ...(status === "Recording" &&
              !paused && {
                "@keyframes chipPulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.55 },
                },
                animation: "chipPulse 1.4s ease-in-out infinite",
              }),
          }}
        >
          <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: chipFg, flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.07em",
              color: chipFg,
              fontFamily: MS_FONTS.sans,
            }}
          >
            {chipLabel}
          </Typography>
        </Box>

        {isActive && (
          <Typography
            sx={{
              fontFamily: MS_FONTS.mono,
              fontSize: "1.25rem",
              fontWeight: 500,
              color: paused ? T.textMuted : T.text,
              letterSpacing: "-0.01em",
            }}
          >
            {formatSecs(elapsed)}
          </Typography>
        )}
      </Box>

      {/* Ring + waveform */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: `2.5px solid ${ringColor}`,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...(status === "Recording" &&
              !paused && {
                "@keyframes ringPulse": {
                  "0%, 100%": { boxShadow: "0 0 0 0 oklch(0.62 0.155 25 / 0.30)" },
                  "60%": { boxShadow: "0 0 0 10px oklch(0.62 0.155 25 / 0)" },
                },
                animation: "ringPulse 2s ease-out infinite",
              }),
          }}
        >
          <MicIcon sx={{ fontSize: 24, color: micColor }} />
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "3px",
            height: 44,
            overflow: "hidden",
            opacity: isTerminal ? 0.35 : paused ? 0.45 : 1,
          }}
        >
          {Array.from({ length: BARS }, (_, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                maxWidth: 5,
                borderRadius: "2px",
                background: paused ? T.textDim : status === "Recording" ? T.recording : T.textDim,
                transformOrigin: "bottom",
                height: "100%",
                "@keyframes barWave": {
                  "0%, 100%": { transform: "scaleY(0.10)" },
                  "50%": { transform: "scaleY(1)" },
                },
                animation:
                  status === "Recording" && !paused
                    ? `barWave ${0.65 + (i % 13) * 0.065}s ${(i % 11) * 0.055}s ease-in-out infinite`
                    : "none",
                transform: "scaleY(0.10)",
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Buttons */}
      {!isTerminal && (
        <Box sx={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          {!recording && (
            <>
              <Button variant="outlined" startIcon={<SettingsVoiceIcon />} onClick={onTestMic}>
                Testează microfon
              </Button>
              <Button variant="contained" startIcon={<MicIcon />} onClick={onStart}>
                Pornire
              </Button>
            </>
          )}
          {recording && !paused && (
            <Button
              variant="outlined"
              startIcon={<PauseCircleOutlineIcon />}
              onClick={onPause}
              sx={{
                borderColor: T.warning,
                color: T.warning,
                "&:hover": { borderColor: T.warning, background: T.warningSoft },
              }}
            >
              Pauză
            </Button>
          )}
          {recording && paused && (
            <Button variant="outlined" startIcon={<PlayCircleOutlineIcon />} onClick={onResume}>
              Continuare
            </Button>
          )}
          {recording && (
            <Button variant="outlined" color="error" startIcon={<StopIcon />} onClick={onStop}>
              Oprire
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default RecordingControls;
