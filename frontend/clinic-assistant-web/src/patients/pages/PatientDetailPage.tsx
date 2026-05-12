import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
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
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";
import { usePageHeader } from "@/shared/PageHeaderContext";

const T = MS_LIGHT;

const cardSx = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: "14px",
  p: "20px",
} as const;

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography
    sx={{
      fontSize: "0.6875rem",
      fontWeight: 600,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      color: T.textDim,
      fontFamily: MS_FONTS.sans,
      mb: "14px",
    }}
  >
    {children}
  </Typography>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
    <Typography sx={{ fontSize: "0.6875rem", fontWeight: 600, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: "0.9rem", color: T.text }}>
      {value}
    </Typography>
  </Box>
);

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getPatientById } = usePatientApi();
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const notify = useNotification();
  const { setHeader } = usePageHeader();
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

  useEffect(() => {
    if (patient) {
      setHeader({
        title: `${patient.lastName} ${patient.firstName}`,
        subtitle: "Detalii pacient",
        breadcrumbs: ["Pacienți", `${patient.lastName} ${patient.firstName}`],
      });
    }
    return () => setHeader({ title: "" });
  }, [patient, setHeader]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress sx={{ color: T.accent }} />
      </Box>
    );
  }

  if (!patient) {
    return null;
  }

  const initials = `${patient.firstName[0] ?? ""}${patient.lastName[0] ?? ""}`.toUpperCase();
  const age = Math.floor(
    (Date.now() - new Date(patient.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/patients")}
        sx={{ mb: "20px", color: T.textMuted, "&:hover": { color: T.text, background: T.surfaceAlt } }}
      >
        Listă pacienți
      </Button>

      {/* Profile header card */}
      <Box
        sx={{
          ...cardSx,
          display: "flex",
          alignItems: "center",
          gap: "20px",
          mb: "16px",
          flexWrap: "wrap",
        }}
      >
        <Avatar
          sx={{
            width: 68,
            height: 68,
            bgcolor: T.accentSoft,
            color: T.accentInk,
            fontSize: "1.5rem",
            fontWeight: 600,
            fontFamily: MS_FONTS.sans,
            flexShrink: 0,
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: T.text,
              fontFamily: MS_FONTS.sans,
              letterSpacing: "-0.2px",
            }}
          >
            {patient.lastName} {patient.firstName}
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted, mt: "2px" }}>
            {patient.email}
          </Typography>
          <Box sx={{ display: "flex", gap: "6px", mt: "10px", flexWrap: "wrap" }}>
            <Chip label={SexLabels[patient.sex]} size="small" variant="outlined" />
            <Chip label={`${age} ani`} size="small" variant="outlined" />
            <Chip
              label={new Date(patient.birthDate).toLocaleDateString("ro-RO")}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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

      {/* Info + Docs grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: "16px" }}>
        {/* Personal info card */}
        <Box sx={cardSx}>
          <SectionLabel>Date personale</SectionLabel>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <InfoRow label="Email" value={patient.email} />
              <InfoRow label="Telefon" value={patient.phoneNumber ?? "—"} />
            </Box>
            <Divider sx={{ borderColor: T.border }} />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <InfoRow label="CNP" value={patient.identityNumber} />
              <InfoRow label="Sex" value={SexLabels[patient.sex]} />
            </Box>
            <Divider sx={{ borderColor: T.border }} />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <InfoRow
                label="Data nașterii"
                value={new Date(patient.birthDate).toLocaleDateString("ro-RO")}
              />
              <InfoRow label="Adresă" value={patient.address} />
            </Box>
          </Box>
        </Box>

        {/* Documents card */}
        <Box sx={cardSx}>
          <SectionLabel>Documente</SectionLabel>
          <DocumentsPanel
            patientId={patient.id}
            sessionId={null}
            readOnly={!hasRole(Roles.Doctor)}
          />
        </Box>
      </Box>

      <ResetPasswordDialog
        open={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
        targetUserId={patient.id}
        targetUserName={`${patient.firstName} ${patient.lastName}`}
      />
    </Box>
  );
};

export default PatientDetailPage;
