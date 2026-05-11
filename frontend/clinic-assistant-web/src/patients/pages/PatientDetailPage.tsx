import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockResetIcon from "@mui/icons-material/LockReset";
import usePatientApi from "@/patients/usePatientApi";
import ResetPasswordDialog from "@/auth/components/ResetPasswordDialog";
import DocumentsPanel from "@/documents/components/DocumentsPanel";
import { extractErrorMessages } from "@/core/errorMessages";
import useNotification from "@/shared/NotificationContext";
import { SexLabels } from "@/shared/types/enums";
import useAuth from "@/auth/useAuth";
import { Roles } from "@/shared/types/enums";
import type { PatientResponseDTO } from "@/patients/props";

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getPatientById } = usePatientApi();
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const notify = useNotification();
  const [patient, setPatient] = useState<PatientResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  const fetchPatient = useCallback(async () => {
    if (!id) {
      return;
    }
    setLoading(true);
    try {
      const data = await getPatientById(id);
      setPatient(data);
    } catch (err) {
      extractErrorMessages(err).forEach((m) => notify(m, "error"));
    } finally {
      setLoading(false);
    }
  }, [id, getPatientById]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/patients")}
        sx={{ mb: 1 }}
      >
        Listă pacienți
      </Button>
      {patient && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Typography variant="h5">
              {patient.lastName} {patient.firstName}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {hasRole(Roles.Admin) && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<LockResetIcon />}
                  onClick={() => setResetPasswordOpen(true)}
                >
                  Resetează parola
                </Button>
              )}
              {hasRole(Roles.Doctor) && (
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => navigate(`/consultations/new?patientId=${patient.id}`)}
                >
                  Consultație nouă
                </Button>
              )}
            </Box>
          </Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <Typography><strong>Email:</strong> {patient.email}</Typography>
              <Typography><strong>Telefon:</strong> {patient.phoneNumber ?? "—"}</Typography>
              <Typography><strong>CNP:</strong> {patient.identityNumber}</Typography>
              <Typography><strong>Sex:</strong> {SexLabels[patient.sex]}</Typography>
              <Typography><strong>Data nașterii:</strong> {new Date(patient.birthDate).toLocaleDateString("ro-RO")}</Typography>
              <Typography><strong>Adresă:</strong> {patient.address}</Typography>
            </Box>
          </Paper>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" mb={1}>Documente</Typography>
          <DocumentsPanel patientId={patient.id} sessionId={null} readOnly={!hasRole(Roles.Doctor)} />
          <ResetPasswordDialog
            open={resetPasswordOpen}
            onClose={() => setResetPasswordOpen(false)}
            targetUserId={patient.id}
            targetUserName={`${patient.firstName} ${patient.lastName}`}
          />
        </>
      )}
    </Box>
  );
};

export default PatientDetailPage;
