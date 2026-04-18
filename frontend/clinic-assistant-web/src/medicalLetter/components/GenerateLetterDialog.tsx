import { useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import useMedicalLetterApi from "@/medicalLetter/useMedicalLetterApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import type { MedicalLetterResponseDTO } from "@/medicalLetter/props";

const LETTER_TYPES = ["Scrisoare medicală", "Bilet de trimitere", "Rețetă", "Raport medical"];

interface Props {
  open: boolean;
  sessionId: string;
  onGenerated: (letter: MedicalLetterResponseDTO) => void;
  onClose: () => void;
}

const GenerateLetterDialog = ({ open, sessionId, onGenerated, onClose }: Props) => {
  const { createLetter } = useMedicalLetterApi();
  const [letterType, setLetterType] = useState(LETTER_TYPES[0]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleGenerate = async () => {
    setErrors([]);
    setLoading(true);
    try {
      const letter = await createLetter({ sessionId, letterType, location });
      onGenerated(letter);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Generează scrisoare medicală</DialogTitle>
      <DialogContent>
        <ErrorBanner messages={errors} />
        <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
          <InputLabel>Tip scrisoare</InputLabel>
          <Select value={letterType} label="Tip scrisoare" onChange={(e) => setLetterType(e.target.value)}>
            {LETTER_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Localitate"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Anulare
        </Button>
        <Button onClick={handleGenerate} variant="contained" disabled={!location || loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : "Generează"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateLetterDialog;
