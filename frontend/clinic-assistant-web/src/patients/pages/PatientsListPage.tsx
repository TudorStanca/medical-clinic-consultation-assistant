import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
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
import usePatientApi from "@/patients/usePatientApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import type { PatientResponseDTO } from "@/patients/props";

const PatientsListPage = () => {
  const { getAllPatients } = usePatientApi();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setErrors([]);
    try {
      const data = await getAllPatients();
      setPatients(data);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  }, [getAllPatients]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Pacienți</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/patients/new")}>
          Adaugă pacient
        </Button>
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
                <TableCell>Nume</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>CNP</TableCell>
                <TableCell>Telefon</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/patients/${p.id}`)}
                >
                  <TableCell>{p.lastName} {p.firstName}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.identityNumber}</TableCell>
                  <TableCell>{p.phoneNumber ?? "—"}</TableCell>
                </TableRow>
              ))}
              {patients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: "text.secondary" }}>
                    Niciun pacient înregistrat.
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

export default PatientsListPage;
