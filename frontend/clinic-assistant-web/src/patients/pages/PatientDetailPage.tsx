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
import usePatientApi from "@/patients/usePatientApi";
import DocumentsPanel from "@/documents/components/DocumentsPanel";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import { SexLabels } from "@/shared/types/enums";
import useAuth from "@/auth/useAuth";
import { Roles } from "@/shared/types/enums";
import type { PatientResponseDTO } from "@/patients/props";

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getPatientById } = usePatientApi();
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const fetchPatient = useCallback(async () => {
    if (!id) {
      return;
    }
    setLoading(true);
    setErrors([]);
    try {
      const data = await getPatientById(id);
      setPatient(data);
    } catch (err) {
      setErrors(extractErrorMessages(err));
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
      <ErrorBanner messages={errors} />
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
            {(hasRole(Roles.Doctor) || hasRole(Roles.Admin)) && (
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => navigate(`/consultations/new?patientId=${patient.id}`)}
              >
                Consultație nouă
              </Button>
            )}
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
          <DocumentsPanel patientId={patient.id} sessionId={null} />
        </>
      )}
    </Box>
  );
};

export default PatientDetailPage;
