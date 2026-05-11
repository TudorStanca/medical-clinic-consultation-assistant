import { useState } from "react";
import {
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
        <Typography variant="body2" color="text.secondary" mb={2}>
          Comunicați-i pacientului această parolă. Nu mai poate fi recuperată ulterior.
        </Typography>
        <TextField
          value={password}
          fullWidth
          slotProps={{
            input: {
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCopy} edge="end">
                    {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
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
