import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import DoctorForm from "@/doctors/components/DoctorForm";

const NewDoctorPage = () => {
  const navigate = useNavigate();

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" mb={3}>
        Adaugă doctor
      </Typography>
      <DoctorForm onCreated={() => navigate("/doctors")} />
    </Box>
  );
};

export default NewDoctorPage;
