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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockResetIcon from "@mui/icons-material/LockReset";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import DescriptionIcon from "@mui/icons-material/Description";
import useDoctorApi from "@/doctors/useDoctorApi";
import useProfileApi from "@/profile/useProfileApi";
import ResetPasswordDialog from "@/auth/components/ResetPasswordDialog";
import { extractErrorMessages } from "@/core/errorMessages";
import useNotification from "@/shared/NotificationContext";
import type { DoctorResponseDTO } from "@/doctors/props";
import type { DoctorStatsResponseDTO } from "@/profile/props";
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
    <Typography sx={{ fontSize: "0.9rem", color: T.text }}>{value}</Typography>
  </Box>
);

const StatCard = ({
  iconNode,
  label,
  value,
}: {
  iconNode: React.ReactNode;
  label: string;
  value: number;
}) => (
  <Box
    sx={{
      ...cardSx,
      flex: 1,
      minWidth: 160,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      py: "24px",
    }}
  >
    {iconNode}
    <Typography
      sx={{
        fontSize: "2rem",
        fontWeight: 700,
        color: T.text,
        fontFamily: MS_FONTS.sans,
        lineHeight: 1,
      }}
    >
      {value}
    </Typography>
    <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted, textAlign: "center" }}>
      {label}
    </Typography>
  </Box>
);

const DoctorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDoctorById } = useDoctorApi();
  const { getDoctorStatsById } = useProfileApi();
  const notify = useNotification();
  const { setHeader } = usePageHeader();
  const [doctor, setDoctor] = useState<DoctorResponseDTO | null>(null);
  const [stats, setStats] = useState<DoctorStatsResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  const fetchDoctor = useCallback(async () => {
    if (!id) {
      return;
    }
    setLoading(true);
    try {
      const [doctorData, statsData] = await Promise.all([
        getDoctorById(id),
        getDoctorStatsById(id),
      ]);
      setDoctor(doctorData);
      setStats(statsData);
    } catch (err) {
      extractErrorMessages(err).forEach((m) => notify(m, "error"));
    } finally {
      setLoading(false);
    }
  }, [id, getDoctorById, getDoctorStatsById]);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  useEffect(() => {
    if (doctor) {
      setHeader({
        title: `${doctor.lastName} ${doctor.firstName}`,
        subtitle: "Detalii doctor",
        breadcrumbs: ["Doctori", `${doctor.lastName} ${doctor.firstName}`],
      });
    }
    return () => setHeader({ title: "" });
  }, [doctor, setHeader]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress sx={{ color: T.accent }} />
      </Box>
    );
  }

  if (!doctor) {
    return null;
  }

  const initials = `${doctor.firstName[0] ?? ""}${doctor.lastName[0] ?? ""}`.toUpperCase();

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/doctors")}
        sx={{ mb: "20px", color: T.textMuted, "&:hover": { color: T.text, background: T.surfaceAlt } }}
      >
        Listă doctori
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
            {doctor.lastName} {doctor.firstName}
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted, mt: "2px" }}>
            {doctor.email}
          </Typography>
          <Box sx={{ display: "flex", gap: "6px", mt: "10px", flexWrap: "wrap" }}>
            <Chip label={doctor.specialization} size="small" color="primary" />
            <Chip
              label={`Parafă: ${doctor.codParafa}`}
              size="small"
              variant="outlined"
              sx={{ fontFamily: MS_FONTS.mono, fontSize: "0.75rem" }}
            />
          </Box>
        </Box>
        <Button
          variant="outlined"
          color="warning"
          startIcon={<LockResetIcon />}
          onClick={() => setResetPasswordOpen(true)}
        >
          Resetează parola
        </Button>
      </Box>

      {/* Info + Stats grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: "16px" }}>
        {/* Info card */}
        <Box sx={cardSx}>
          <SectionLabel>Date personale</SectionLabel>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <InfoRow label="Email" value={doctor.email} />
              <InfoRow label="Telefon" value={doctor.phoneNumber ?? "—"} />
            </Box>
            <Divider sx={{ borderColor: T.border }} />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <InfoRow label="Specializare" value={doctor.specialization} />
              <InfoRow label="Cod parafă" value={doctor.codParafa} />
            </Box>
          </Box>
        </Box>

        {/* Stats card */}
        {stats && (
          <Box sx={cardSx}>
            <SectionLabel>Statistici</SectionLabel>
            <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <StatCard
                iconNode={
                  <MedicalServicesIcon sx={{ fontSize: 36, color: T.accent }} />
                }
                label="Consultații efectuate"
                value={stats.consultationCount}
              />
              <StatCard
                iconNode={
                  <DescriptionIcon sx={{ fontSize: 36, color: T.warm }} />
                }
                label="Scrisori medicale generate"
                value={stats.medicalLetterCount}
              />
            </Box>
          </Box>
        )}
      </Box>

      <ResetPasswordDialog
        open={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
        targetUserId={doctor.id}
        targetUserName={`${doctor.firstName} ${doctor.lastName}`}
      />
    </Box>
  );
};

export default DoctorDetailPage;
