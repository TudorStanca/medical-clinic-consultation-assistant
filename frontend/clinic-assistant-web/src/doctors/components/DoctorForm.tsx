import { useState } from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import useDoctorApi from "@/doctors/useDoctorApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import type { DoctorResponseDTO } from "@/doctors/props";

interface Props {
  onCreated: (doctor: DoctorResponseDTO) => void;
}

const DoctorForm = ({ onCreated }: Props) => {
  const { createDoctor } = useDoctorApi();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [codParafa, setCodParafa] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      const doctor = await createDoctor({ firstName, lastName, email, password, phoneNumber, specialization, codParafa });
      onCreated(doctor);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <ErrorBanner messages={errors} />
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <TextField label="Prenume" value={firstName} onChange={(e) => setFirstName(e.target.value)} required fullWidth />
        <TextField label="Nume" value={lastName} onChange={(e) => setLastName(e.target.value)} required fullWidth />
      </Box>
      <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
      <TextField label="Parolă" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
      <TextField label="Telefon" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required fullWidth />
      <TextField label="Specializare" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required fullWidth />
      <TextField label="Cod parafă" value={codParafa} onChange={(e) => setCodParafa(e.target.value)} required fullWidth />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? <CircularProgress size={22} color="inherit" /> : "Creează cont doctor"}
      </Button>
    </Box>
  );
};

export default DoctorForm;
