import { Box, Button, Chip } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import type { SessionStatusName } from "@/shared/types/enums";

const STATUS_LABELS: Record<SessionStatusName, string> = {
  Created: "Inițializat",
  Recording: "Se înregistrează",
  Processing: "Se procesează",
  Done: "Finalizat",
  Failed: "Eroare",
  Interrupted: "Întreruptă",
};

const STATUS_COLORS: Record<SessionStatusName, "default" | "primary" | "warning" | "success" | "error"> = {
  Created: "default",
  Recording: "primary",
  Processing: "warning",
  Done: "success",
  Failed: "error",
  Interrupted: "warning",
};

interface Props {
  status: SessionStatusName;
  recording: boolean;
  paused: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}

const RecordingControls = ({ status, recording, paused, onStart, onStop, onPause, onResume }: Props) => {
  const isTerminal = status === "Done" || status === "Failed" || status === "Interrupted" || status === "Processing";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
      <Chip
        label={STATUS_LABELS[status]}
        color={STATUS_COLORS[status]}
        size="small"
        sx={
          status === "Recording"
            ? {
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.4 },
                },
                animation: "pulse 1.4s ease-in-out infinite",
              }
            : undefined
        }
      />
      {paused && (
        <Chip
          label="În pauză"
          color="warning"
          size="small"
          icon={<PauseCircleIcon />}
        />
      )}
      {!isTerminal && (
        <>
          <Button
            variant="contained"
            color="primary"
            startIcon={<MicIcon />}
            disabled={recording}
            onClick={onStart}
          >
            Pornire
          </Button>
          {recording && !paused && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<PauseCircleIcon />}
              onClick={onPause}
            >
              Pauză
            </Button>
          )}
          {recording && paused && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PlayCircleIcon />}
              onClick={onResume}
            >
              Continuare
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<StopIcon />}
            disabled={!recording}
            onClick={onStop}
          >
            Oprire
          </Button>
        </>
      )}
    </Box>
  );
};

export default RecordingControls;
