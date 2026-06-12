import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import useAuth from "@/auth/useAuth";
import useConsultationApi from "@/consultation/useConsultationApi";
import { usePageHeader } from "@/shared/PageHeaderContext";
import { Roles } from "@/shared/types/enums";
import type { SessionSummaryResponse, DashboardStatsResponse } from "@/consultation/props";
import type { SessionStatusName } from "@/shared/types/enums";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";

const T = MS_LIGHT;

const STATUS_LABEL: Record<SessionStatusName, string> = {
  Created: "Inițializat",
  Recording: "Înregistrare",
  Processing: "Se procesează",
  Done: "Finalizat",
  Failed: "Eroare",
  Interrupted: "Întreruptă",
};

const STATUS_COLOR: Record<SessionStatusName, "default" | "primary" | "warning" | "success" | "error"> = {
  Created: "default",
  Recording: "primary",
  Processing: "warning",
  Done: "success",
  Failed: "error",
  Interrupted: "warning",
};

interface StatCard {
  label: string;
  value: string;
  description: string;
  iconNode: React.ReactNode;
  accentBg: string;
  accentColor: string;
}

const StatCardItem = ({ label, value, description, iconNode, accentBg, accentColor }: StatCard) => (
  <Box
    sx={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: "14px",
      p: "18px",
      boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "14px" }}>
      <Typography
        sx={{
          fontSize: "0.7rem",
          fontWeight: 600,
          color: T.textMuted,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "8px",
          background: accentBg,
          color: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {iconNode}
      </Box>
    </Box>
    <Typography
      sx={{ fontSize: "1.75rem", fontWeight: 600, letterSpacing: -0.6, color: T.text, lineHeight: 1, mb: "4px" }}
    >
      {value}
    </Typography>
    <Typography sx={{ fontSize: "0.7188rem", color: T.textMuted }}>{description}</Typography>
  </Box>
);

const DashboardPage = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const { setHeader } = usePageHeader();
  const { getSessionsPaged, getDashboardStats } = useConsultationApi();
  const isDoctor = hasRole(Roles.Doctor);
  const isPatient = hasRole(Roles.Patient);

  const [recentSessions, setRecentSessions] = useState<SessionSummaryResponse[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);

  const todayStr = new Date().toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const capitalizedToday = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);

  useEffect(() => {
    setHeader({
      title: `Bună, ${user?.firstName}!`,
      subtitle: capitalizedToday,
      ...(isDoctor
        ? {
            actions: (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                size="small"
                onClick={() => navigate("/consultations/new")}
              >
                Consultație nouă
              </Button>
            ),
          }
        : {}),
    });
  }, [setHeader, user?.firstName, capitalizedToday, isDoctor, navigate]);

  useEffect(() => {
    getDashboardStats()
      .then((data) => setStats(data))
      .catch(() => {});
  }, [getDashboardStats]);

  useEffect(() => {
    let cancelled = false;
    setLoadingSessions(true);
    getSessionsPaged({ page: 1, pageSize: 5, sortBy: "createdAt", sortDir: "desc", search: "" })
      .then((res) => {
        if (!cancelled) {
          setRecentSessions(res.items);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setLoadingSessions(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [getSessionsPaged]);

  const counterpartLabel = isPatient ? "Doctori consultați" : "Pacienți unici";

  const statCards: StatCard[] = [
    {
      label: "Consultații (săpt.)",
      value: stats ? String(stats.weeklyConsultationCount) : "—",
      description: stats ? "această săptămână" : "indisponibil",
      iconNode: <MedicalServicesOutlinedIcon sx={{ fontSize: 15 }} />,
      accentBg: T.accentSoft,
      accentColor: T.accentInk,
    },
    {
      label: "Scrisori generate",
      value: stats ? String(stats.totalLetterCount) : "—",
      description: stats ? "total" : "indisponibil",
      iconNode: <DescriptionOutlinedIcon sx={{ fontSize: 15 }} />,
      accentBg: T.successSoft,
      accentColor: T.success,
    },
    {
      label: "Timp mediu sesiune",
      value: stats && stats.averageSessionMinutes > 0 ? `${stats.averageSessionMinutes} min` : "—",
      description: stats && stats.averageSessionMinutes > 0 ? "din sesiuni finalizate" : "indisponibil",
      iconNode: <AccessTimeOutlinedIcon sx={{ fontSize: 15 }} />,
      accentBg: T.warmSoft,
      accentColor: T.warm,
    },
    {
      label: counterpartLabel,
      value: stats ? String(stats.uniqueCounterpartCount) : "—",
      description: stats ? "total" : "indisponibil",
      iconNode: <PeopleOutlinedIcon sx={{ fontSize: 15 }} />,
      accentBg: T.surfaceAlt,
      accentColor: T.textMuted,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {isDoctor && (
        <Box
          sx={{
            background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accentInk} 100%)`,
            borderRadius: "16px",
            p: "28px 32px",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              right: -40,
              top: -40,
              width: 220,
              height: 220,
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              right: 80,
              bottom: -60,
              width: 160,
              height: 160,
              borderRadius: "999px",
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "16px",
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <MedicalServicesOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box sx={{ flex: 1, position: "relative", minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.8125rem", opacity: 0.85, mb: "4px" }}>
              Începe ziua de lucru
            </Typography>
            <Typography
              sx={{
                fontFamily: MS_FONTS.serif,
                fontWeight: 400,
                fontSize: "1.625rem",
                letterSpacing: -0.4,
                lineHeight: 1.15,
              }}
            >
              Începe o consultație nouă
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", opacity: 0.85, mt: "4px" }}>
              Audio recorder, transcriere live și scrisoare medicală generată automat.
            </Typography>
          </Box>
          <Button
            onClick={() => navigate("/consultations/new")}
            sx={{
              flexShrink: 0,
              position: "relative",
              background: "white",
              color: T.accentInk,
              fontWeight: 600,
              fontSize: "0.875rem",
              borderRadius: "10px",
              px: "20px",
              py: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              "&:hover": { background: "rgba(255,255,255,0.92)" },
            }}
          >
            <PlayArrowIcon sx={{ fontSize: 16 }} />
            Pornește înregistrarea
          </Button>
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: "16px",
        }}
      >
        {statCards.map((card) => (
          <StatCardItem key={card.label} {...card} />
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" },
          gap: "20px",
          alignItems: "start",
        }}
      >
        <Box
          sx={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: "18px",
              py: "14px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: T.text }}>
              Consultații recente
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Button
              size="small"
              onClick={() => navigate("/consultations")}
              sx={{ fontSize: "0.7813rem", color: T.textMuted }}
            >
              Vezi toate
            </Button>
          </Box>

          {loadingSessions ? (
            <Box sx={{ p: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={36} sx={{ borderRadius: "8px" }} />
              ))}
            </Box>
          ) : recentSessions.length === 0 ? (
            <Box sx={{ p: "32px", textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.875rem", color: T.textMuted }}>
                Nicio consultație înregistrată încă.
              </Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Pacient</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Scrisoare</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentSessions.map((s) => (
                  <TableRow
                    key={s.sessionId}
                    onClick={() => navigate(`/consultations/${s.sessionId}`)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell sx={{ fontFamily: MS_FONTS.mono, fontSize: "0.75rem", color: T.textMuted }}>
                      {new Date(s.createdAt).toLocaleDateString("ro-RO")}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{s.patientFullName}</TableCell>
                    <TableCell>
                      <Chip label={STATUS_LABEL[s.status]} color={STATUS_COLOR[s.status]} size="small" />
                    </TableCell>
                    <TableCell sx={{ color: s.hasLetter ? T.success : T.textDim }}>
                      {s.hasLetter ? "✓" : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Box
            sx={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: "14px",
              p: "18px",
            }}
          >
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: T.text, mb: "14px" }}>
              Acțiuni rapide
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {isDoctor && (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayArrowIcon />}
                  onClick={() => navigate("/consultations/new")}
                  sx={{ justifyContent: "flex-start" }}
                >
                  Consultație nouă
                </Button>
              )}
              <Button
                variant="outlined"
                fullWidth
                startIcon={<MedicalServicesOutlinedIcon />}
                onClick={() => navigate("/consultations")}
                sx={{ justifyContent: "flex-start" }}
              >
                Toate consultațiile
              </Button>
              {hasRole(Roles.Doctor) || hasRole(Roles.Admin) ? (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PeopleOutlinedIcon />}
                  onClick={() => navigate("/patients")}
                  sx={{ justifyContent: "flex-start" }}
                >
                  Lista pacienților
                </Button>
              ) : null}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
