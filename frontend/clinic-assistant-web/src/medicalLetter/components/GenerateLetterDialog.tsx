import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import useMedicalLetterApi from "@/medicalLetter/useMedicalLetterApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import type { MedicalLetterResponseDTO } from "@/medicalLetter/props";
import { MS_LIGHT } from "@/theme/tokens";

const T = MS_LIGHT;

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
  const [includeAllDocs, setIncludeAllDocs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleGenerate = async () => {
    setErrors([]);
    setLoading(true);
    try {
      const letter = await createLetter({
        sessionId,
        letterType,
        location,
        includeAllPatientDocuments: includeAllDocs,
      });
      onGenerated(letter);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <AutoAwesomeIcon sx={{ fontSize: 20, color: T.accent }} />
          Generează scrisoare medicală
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "4px" }}>
          <ErrorBanner messages={errors} />

          {loading && (
            <Box
              sx={{
                background: T.accentSoft,
                border: `1px solid ${T.accent}33`,
                borderRadius: "10px",
                p: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <CircularProgress size={18} sx={{ color: T.accent, flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.875rem", color: T.accentInk }}>
                Scrisoarea se generează cu ajutorul AI...
              </Typography>
            </Box>
          )}

          <FormControl fullWidth>
            <InputLabel>Tip scrisoare</InputLabel>
            <Select
              value={letterType}
              label="Tip scrisoare"
              onChange={(e) => setLetterType(e.target.value)}
              disabled={loading}
            >
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
            disabled={loading}
          />

          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeAllDocs}
                  onChange={(e) => setIncludeAllDocs(e.target.checked)}
                  disabled={loading}
                  sx={{
                    color: T.border,
                    "&.Mui-checked": { color: T.accent },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: "0.875rem", color: T.text }}>
                  Include toate documentele pacientului
                </Typography>
              }
            />
            <FormHelperText sx={{ ml: "30px", mt: "-4px" }}>
              Documentele acestei consultații sunt mereu incluse.
            </FormHelperText>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Anulare
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={!location || loading}
          startIcon={loading ? undefined : <AutoAwesomeIcon sx={{ fontSize: 16 }} />}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Generează"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateLetterDialog;
