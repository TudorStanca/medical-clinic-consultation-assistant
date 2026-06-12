import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import PatientForm from "@/patients/components/PatientForm";
import type { PatientResponseDTO } from "@/patients/props";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";
import { usePageHeader } from "@/shared/PageHeaderContext";

const T = MS_LIGHT;

const NewPatientPage = () => {
  const navigate = useNavigate();
  const { setHeader } = usePageHeader();

  useEffect(() => {
    setHeader({ title: "Pacient nou", subtitle: "Adaugă un nou pacient" });
    return () => setHeader({ title: "" });
  }, [setHeader]);

  const handleCreated = (patient: PatientResponseDTO) => {
    navigate(`/patients/${patient.id}`);
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography
        sx={{
          fontSize: "1.375rem",
          fontWeight: 600,
          color: T.text,
          fontFamily: MS_FONTS.sans,
          letterSpacing: "-0.3px",
          mb: "6px",
        }}
      >
        Adaugă pacient nou
      </Typography>
      <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted, mb: "24px" }}>
        Completați datele de mai jos pentru a crea un cont de pacient.
      </Typography>
      <Box
        sx={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: "14px",
          p: "24px",
        }}
      >
        <PatientForm onCreated={handleCreated} />
      </Box>
    </Box>
  );
};

export default NewPatientPage;
