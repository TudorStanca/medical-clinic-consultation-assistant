import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import KeyIcon from "@mui/icons-material/Key";
import { MS_LIGHT } from "@/theme/tokens";

const T = MS_LIGHT;

interface Props {
  open: boolean;
  password: string;
  onClose: () => void;
}

const GeneratedPasswordDialog = ({ open, password, onClose }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Cont pacient creat</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Box
            sx={{
              background: T.warningSoft,
              border: `1px solid ${T.warning}44`,
              borderRadius: "10px",
              p: "14px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <KeyIcon sx={{ fontSize: 20, color: T.warning, flexShrink: 0, mt: "1px" }} />
            <Typography sx={{ fontSize: "0.875rem", color: T.text, lineHeight: 1.6 }}>
              Comunicați-i pacientului această parolă. <strong>Nu mai poate fi recuperată ulterior.</strong>
            </Typography>
          </Box>
          <TextField
            value={password}
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
                sx: { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: "0.9rem", letterSpacing: "0.05em" },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleCopy}
                      edge="end"
                      sx={{
                        color: copied ? T.success : T.textMuted,
                        "&:hover": { background: T.surfaceAlt },
                      }}
                    >
                      {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Am comunicat parola
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GeneratedPasswordDialog;
