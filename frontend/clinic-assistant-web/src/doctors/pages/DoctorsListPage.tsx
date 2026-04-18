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
import useDoctorApi from "@/doctors/useDoctorApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import type { DoctorResponseDTO } from "@/doctors/props";

const DoctorsListPage = () => {
  const { getAllDoctors } = useDoctorApi();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<DoctorResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setErrors([]);
    try {
      const data = await getAllDoctors();
      setDoctors(data);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  }, [getAllDoctors]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Doctori</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/doctors/new")}>
          Adaugă doctor
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
                <TableCell>Specializare</TableCell>
                <TableCell>Cod parafă</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.lastName} {d.firstName}</TableCell>
                  <TableCell>{d.email}</TableCell>
                  <TableCell>{d.specialization}</TableCell>
                  <TableCell>{d.codParafa}</TableCell>
                </TableRow>
              ))}
              {doctors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: "text.secondary" }}>
                    Niciun doctor înregistrat.
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

export default DoctorsListPage;
