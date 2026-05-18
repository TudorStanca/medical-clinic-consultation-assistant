import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import DescriptionIcon from "@mui/icons-material/Description";
import useProfileApi from "@/profile/useProfileApi";
import { extractErrorMessages } from "@/core/errorMessages";
import useNotification from "@/shared/NotificationContext";
import type { DoctorStatsResponseDTO } from "@/profile/props";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";

const T = MS_LIGHT;

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
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: "14px",
      p: "24px 20px",
      flex: 1,
      minWidth: 180,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
    }}
  >
    {iconNode}
    <Typography
      sx={{
        fontSize: "2.25rem",
        fontWeight: 700,
        color: T.text,
        fontFamily: MS_FONTS.sans,
        lineHeight: 1,
      }}
    >
      {value}
    </Typography>
    <Typography
      sx={{ fontSize: "0.8125rem", color: T.textMuted, textAlign: "center" }}
    >
      {label}
    </Typography>
  </Box>
);

const DoctorStatsTab = () => {
  const { getDoctorStats } = useProfileApi();
  const notify = useNotification();
  const [stats, setStats] = useState<DoctorStatsResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doFetch = async () => {
      try {
        const data = await getDoctorStats();
        setStats(data);
      } catch (err) {
        extractErrorMessages(err).forEach((m) => notify(m, "error"));
      } finally {
        setLoading(false);
      }
    };

    doFetch();
  }, [getDoctorStats]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress sx={{ color: T.accent }} />
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      <StatCard
        iconNode={<MedicalServicesIcon sx={{ fontSize: 40, color: T.accent }} />}
        label="Consultații efectuate"
        value={stats.consultationCount}
      />
      <StatCard
        iconNode={<DescriptionIcon sx={{ fontSize: 40, color: T.warm }} />}
        label="Scrisori medicale generate"
        value={stats.medicalLetterCount}
      />
    </Box>
  );
};

export default DoctorStatsTab;
