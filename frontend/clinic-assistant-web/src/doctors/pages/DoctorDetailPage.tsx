import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockResetIcon from "@mui/icons-material/LockReset";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import DescriptionIcon from "@mui/icons-material/Description";
import useDoctorApi from "@/doctors/useDoctorApi";
import useProfileApi from "@/profile/useProfileApi";
import ResetPasswordDialog from "@/auth/components/ResetPasswordDialog";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import type { DoctorResponseDTO } from "@/doctors/props";
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

const DoctorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDoctorById } = useDoctorApi();
  const { getDoctorStatsById } = useProfileApi();

  const [doctor, setDoctor] = useState<DoctorResponseDTO | null>(null);
  const [stats, setStats] = useState<DoctorStatsResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  const fetchDoctor = useCallback(async () => {
    if (!id) {
      return;
    }
    setLoading(true);
    setErrors([]);
    try {
      const [doctorData, statsData] = await Promise.all([
        getDoctorById(id),
        getDoctorStatsById(id),
      ]);
      setDoctor(doctorData);
      setStats(statsData);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  }, [id, getDoctorById, getDoctorStatsById]);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

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
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/doctors")} sx={{ mb: 1 }}>
        Listă doctori
      </Button>
      {doctor && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Typography variant="h5">
              {doctor.lastName} {doctor.firstName}
            </Typography>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<LockResetIcon />}
              onClick={() => setResetPasswordOpen(true)}
            >
              Resetează parola
            </Button>
          </Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <Typography><strong>Email:</strong> {doctor.email}</Typography>
              <Typography><strong>Telefon:</strong> {doctor.phoneNumber ?? "—"}</Typography>
              <Typography><strong>Specializare:</strong> {doctor.specialization}</Typography>
              <Typography><strong>Cod parafă:</strong> {doctor.codParafa}</Typography>
            </Box>
          </Paper>
          {stats && (
            <>
              <Typography variant="h6" mb={1}>Statistici</Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
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
            </>
          )}
          <ResetPasswordDialog
            open={resetPasswordOpen}
            onClose={() => setResetPasswordOpen(false)}
            targetUserId={doctor.id}
            targetUserName={`${doctor.firstName} ${doctor.lastName}`}
          />
        </>
      )}
    </Box>
  );
};

export default DoctorDetailPage;
