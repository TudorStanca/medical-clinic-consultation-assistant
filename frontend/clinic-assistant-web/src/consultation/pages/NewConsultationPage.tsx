import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import useConsultationApi from "@/consultation/useConsultationApi";
import PatientPicker from "@/consultation/components/PatientPicker";
import { extractErrorMessages } from "@/core/errorMessages";
import useNotification from "@/shared/NotificationContext";
import useAuth from "@/auth/useAuth";
import usePatientApi from "@/patients/usePatientApi";
import type { PatientResponseDTO } from "@/patients/props";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";
import { usePageHeader } from "@/shared/PageHeaderContext";

const T = MS_LIGHT;

const NewConsultationPage = () => {
  const { createSession } = useConsultationApi();
  const { user } = useAuth();
  const { getPatientById } = usePatientApi();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setHeader } = usePageHeader();

  const notify = useNotification();
  const [patient, setPatient] = useState<PatientResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHeader({ title: "Consultație nouă", subtitle: "Selectează pacientul și începe înregistrarea" });
    return () => setHeader({ title: "" });
  }, [setHeader]);

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
    <Box sx={{ maxWidth: 560 }}>
      <Typography
        sx={{
          fontSize: "1.375rem",
          fontWeight: 600,
          color: T.text,
          fontFamily: MS_FONTS.sans,
          letterSpacing: "-0.3px",
          mb: "6px",
        }}
      >
        Consultație nouă
      </Typography>
      <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted, mb: "24px" }}>
        Selectați pacientul pentru a iniția o sesiune de consultație.
      </Typography>
      <Box
        sx={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: "14px",
          p: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Patient picker section */}
        <Box>
          <Typography
            sx={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: T.textDim,
              fontFamily: MS_FONTS.sans,
              mb: "8px",
            }}
          >
            Pacient
          </Typography>
          <PatientPicker value={patient} onChange={setPatient} />
        </Box>

        {/* Selected patient info */}
        {patient && (
          <Box
            sx={{
              background: T.accentSoft,
              border: `1px solid ${T.accent}22`,
              borderRadius: "10px",
              p: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <PersonOutlineIcon sx={{ color: T.accent, fontSize: 20 }} />
            <Box>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: T.accentInk }}>
                {patient.lastName} {patient.firstName}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: T.accent }}>
                {patient.email}
              </Typography>
            </Box>
          </Box>
        )}

        {patient && (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              p: "14px",
              borderRadius: "10px",
              background: T.warningSoft,
              color: T.warning,
              fontSize: "0.75rem",
              lineHeight: 1.55,
            }}
          >
            <ShieldOutlinedIcon sx={{ fontSize: 18, flexShrink: 0, mt: "1px" }} />
            <span>
              Pacientul va fi notificat despre înregistrarea audio la începutul sesiunii. Confirmă
              verbal consimțământul înainte de Pornire.
            </span>
          </Box>
        )}

        <Button
          variant="contained"
          size="large"
          startIcon={
            loading ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />
          }
          disabled={!patient || loading}
          onClick={handleStart}
          sx={{ mt: "4px" }}
        >
          Începe consultația
        </Button>
      </Box>
    </Box>
  );
};

export default NewConsultationPage;
