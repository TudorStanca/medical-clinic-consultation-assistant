import { Box, Button, Chip } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import type { SessionStatusName } from "@/shared/types/enums";

const STATUS_LABELS: Record<SessionStatusName, string> = {
  Created: "Inițializat",
  Recording: "Se înregistrează",
  Processing: "Se procesează",
  Done: "Finalizat",
  Failed: "Eroare",
};

const STATUS_COLORS: Record<SessionStatusName, "default" | "primary" | "warning" | "success" | "error"> = {
  Created: "default",
  Recording: "primary",
  Processing: "warning",
  Done: "success",
  Failed: "error",
};

interface Props {
  status: SessionStatusName;
  recording: boolean;
  onStart: () => void;
  onStop: () => void;
}

const RecordingControls = ({ status, recording, onStart, onStop }: Props) => {
  const isTerminal = status === "Done" || status === "Failed";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
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
