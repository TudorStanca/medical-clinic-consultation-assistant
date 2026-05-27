import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import useLetterAccessApi from "@/access/useLetterAccessApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import type { DoctorSearchableResponseDTO, LetterAccessGrantResponseDTO } from "@/access/props";

interface Props {
  open: boolean;
  onCreated: (grant: LetterAccessGrantResponseDTO) => void;
  onClose: () => void;
}

const AddGrantDialog = ({ open, onCreated, onClose }: Props) => {
  const { createGrant, getSourceDoctors, getSearchableDoctors } = useLetterAccessApi();

  const [sourceDoctors, setSourceDoctors] = useState<DoctorSearchableResponseDTO[]>([]);
  const [allDoctors, setAllDoctors] = useState<DoctorSearchableResponseDTO[]>([]);
  const [selectedSource, setSelectedSource] = useState<DoctorSearchableResponseDTO | null>(null);
  const [selectedGrantee, setSelectedGrantee] = useState<DoctorSearchableResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setSelectedSource(null);
      setSelectedGrantee(null);
      setErrors([]);
      return;
    }

    getSourceDoctors().then(setSourceDoctors).catch(() => setSourceDoctors([]));
    getSearchableDoctors().then(setAllDoctors).catch(() => setAllDoctors([]));
  }, [open, getSourceDoctors, getSearchableDoctors]);

  const handleSubmit = async () => {
    if (!selectedSource || !selectedGrantee) {
      return;
    }

    setErrors([]);
    setLoading(true);
    try {
      const grant = await createGrant({
        granteeDoctorId: selectedGrantee.id,
        sourceDoctorId: selectedSource.id,
      });
      onCreated(grant);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  const doctorLabel = (d: DoctorSearchableResponseDTO) => `Dr. ${d.firstName} ${d.lastName} — ${d.specialization}`;

  const granteeCandidates = allDoctors.filter((d) => d.id !== selectedSource?.id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <LockOpenIcon sx={{ fontSize: 20 }} />
          Acordă acces la scrisori
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "4px" }}>
          <ErrorBanner messages={errors} />
          <Typography variant="body2" color="text.secondary">
            Selectează medicul ale cărui scrisori vrei să le partajezi și medicul căruia îi acorzi accesul.
          </Typography>
          <Autocomplete
            options={sourceDoctors}
            getOptionLabel={doctorLabel}
            value={selectedSource}
            onChange={(_, v) => {
              setSelectedSource(v);
              if (selectedGrantee?.id === v?.id) {
                setSelectedGrantee(null);
              }
            }}
            disabled={loading}
            renderInput={(params) => (
              <TextField {...params} label="Scrisorile de la medicul" required />
            )}
          />
          <Autocomplete
            options={granteeCandidates}
            getOptionLabel={doctorLabel}
            value={selectedGrantee}
            onChange={(_, v) => setSelectedGrantee(v)}
            disabled={loading || !selectedSource}
            renderInput={(params) => (
              <TextField {...params} label="Acces acordat medicului" required />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Anulare
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedSource || !selectedGrantee || loading}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Acordă acces"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddGrantDialog;
