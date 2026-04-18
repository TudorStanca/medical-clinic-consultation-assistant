import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import PatientForm from "@/patients/components/PatientForm";
import type { PatientResponseDTO } from "@/patients/props";

const NewPatientPage = () => {
  const navigate = useNavigate();

  const handleCreated = (patient: PatientResponseDTO) => {
    navigate(`/patients/${patient.id}`);
  };

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" mb={3}>
        Adaugă pacient nou
      </Typography>
      <PatientForm onCreated={handleCreated} />
    </Box>
  );
};

export default NewPatientPage;
