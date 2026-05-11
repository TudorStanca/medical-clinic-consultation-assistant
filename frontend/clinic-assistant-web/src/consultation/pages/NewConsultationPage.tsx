import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import useConsultationApi from "@/consultation/useConsultationApi";
import PatientPicker from "@/consultation/components/PatientPicker";
import { extractErrorMessages } from "@/core/errorMessages";
import useNotification from "@/shared/NotificationContext";
import useAuth from "@/auth/useAuth";
import usePatientApi from "@/patients/usePatientApi";
import type { PatientResponseDTO } from "@/patients/props";

const NewConsultationPage = () => {
  const { createSession } = useConsultationApi();
  const { user } = useAuth();
  const { getPatientById } = usePatientApi();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const notify = useNotification();
  const [patient, setPatient] = useState<PatientResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const preloadId = searchParams.get("patientId");
    if (!preloadId) {
      return;
    }
    getPatientById(preloadId)
      .then((p) => setPatient(p))
      .catch(() => {});
  }, [searchParams, getPatientById]);

  const handleStart = async () => {
    if (!patient || !user) {
      return;
    }
    setLoading(true);
    try {
      const { sessionId } = await createSession(user.id, patient.id);
      navigate(`/consultations/${sessionId}`);
    } catch (err) {
      extractErrorMessages(err).forEach((m) => notify(m, "error"));
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" mb={3}>
        Consultație nouă
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <PatientPicker value={patient} onChange={setPatient} />
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
            disabled={!patient || loading}
            onClick={handleStart}
          >
            Începe consultația
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewConsultationPage;
