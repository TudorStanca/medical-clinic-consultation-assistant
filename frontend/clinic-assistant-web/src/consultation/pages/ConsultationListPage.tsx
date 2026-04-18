import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import useConsultationApi from "@/consultation/useConsultationApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import useAuth from "@/auth/useAuth";
import { Roles } from "@/shared/types/enums";
import type { SessionSummaryResponse } from "@/consultation/props";
import type { SessionStatusName } from "@/shared/types/enums";

const STATUS_COLOR: Record<SessionStatusName, "default" | "primary" | "warning" | "success" | "error"> = {
  Created: "default",
  Recording: "primary",
  Processing: "warning",
  Done: "success",
  Failed: "error",
};

const STATUS_LABEL: Record<SessionStatusName, string> = {
  Created: "Inițializat",
  Recording: "Înregistrare",
  Processing: "Se procesează",
  Done: "Finalizat",
  Failed: "Eroare",
};

const ConsultationListPage = () => {
  const { getMySessions } = useConsultationApi();
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setErrors([]);
    try {
      const data = await getMySessions();
      setSessions(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  }, [getMySessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Consultații</Typography>
        {hasRole(Roles.Doctor) && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/consultations/new")}>
            Consultație nouă
          </Button>
        )}
      </Box>
      <ErrorBanner messages={errors} />
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Pacient</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Scrisoare</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.sessionId}>
                  <TableCell>{new Date(s.createdAt).toLocaleDateString("ro-RO")}</TableCell>
                  <TableCell>{s.patientFullName}</TableCell>
                  <TableCell>{s.doctorFullName}</TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABEL[s.status]}
                      color={STATUS_COLOR[s.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{s.hasLetter ? "✓" : "—"}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => navigate(`/consultations/${s.sessionId}`)}>
                      Deschide
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: "text.secondary" }}>
                    Nicio consultație.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ConsultationListPage;
