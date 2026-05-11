import { useEffect, useState } from "react";
import { Box, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import DescriptionIcon from "@mui/icons-material/Description";
import useProfileApi from "@/profile/useProfileApi";
import { extractErrorMessages } from "@/core/errorMessages";
import useNotification from "@/shared/NotificationContext";
import type { DoctorStatsResponseDTO } from "@/profile/props";

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <Card variant="outlined" sx={{ flex: 1, minWidth: 160 }}>
    <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, py: 3 }}>
      {icon}
      <Typography variant="h4" fontWeight="bold">
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {label}
      </Typography>
    </CardContent>
  </Card>
);

const DoctorStatsTab = () => {
  const { getDoctorStats } = useProfileApi();
  const notify = useNotification();
  const [stats, setStats] = useState<DoctorStatsResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getDoctorStats();
        setStats(data);
      } catch (err) {
        extractErrorMessages(err).forEach((m) => notify(m, "error"));
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [getDoctorStats]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {stats && (
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <StatCard
            icon={<MedicalServicesIcon color="primary" sx={{ fontSize: 40 }} />}
            label="Consultații efectuate"
            value={stats.consultationCount}
          />
          <StatCard
            icon={<DescriptionIcon color="primary" sx={{ fontSize: 40 }} />}
            label="Scrisori medicale generate"
            value={stats.medicalLetterCount}
          />
        </Box>
      )}
    </Box>
  );
};

export default DoctorStatsTab;
