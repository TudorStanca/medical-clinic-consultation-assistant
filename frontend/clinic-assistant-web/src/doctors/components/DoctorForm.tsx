import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import useDoctorApi from "@/doctors/useDoctorApi";
import GeneratedPasswordDialog from "@/patients/components/GeneratedPasswordDialog";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { generatePassword } from "@/patients/utils/generatePassword";
import { extractErrorMessages } from "@/core/errorMessages";
import type { DoctorResponseDTO } from "@/doctors/props";

interface Props {
  onCreated: (doctor: DoctorResponseDTO) => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const DoctorForm = ({ onCreated, onDirtyChange }: Props) => {
  const { createDoctor } = useDoctorApi();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [createdDoctor, setCreatedDoctor] = useState<DoctorResponseDTO | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [codParafa, setCodParafa] = useState("");

  useEffect(() => {
    const dirty = [firstName, lastName, email, phoneNumber, specialization, codParafa].some((v) => v !== "");
    onDirtyChange?.(dirty);
  }, [firstName, lastName, email, phoneNumber, specialization, codParafa, onDirtyChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    const password = generatePassword();
    setLoading(true);
    try {
      const doctor = await createDoctor({ firstName, lastName, email, password, phoneNumber, specialization, codParafa });
      setCreatedDoctor(doctor);
      setGeneratedPassword(password);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordDialogClose = () => {
    if (createdDoctor) {
      onCreated(createdDoctor);
    }
    setGeneratedPassword(null);
    setCreatedDoctor(null);
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <ErrorBanner messages={errors} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField label="Prenume" value={firstName} onChange={(e) => setFirstName(e.target.value)} required fullWidth />
          <TextField label="Nume" value={lastName} onChange={(e) => setLastName(e.target.value)} required fullWidth />
        </Box>
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
        <TextField label="Telefon" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required fullWidth />
        <TextField label="Specializare" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required fullWidth />
        <TextField label="Cod parafă" value={codParafa} onChange={(e) => setCodParafa(e.target.value)} required fullWidth />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={22} color="inherit" /> : "Creează cont doctor"}
        </Button>
      </Box>
      {generatedPassword && (
        <GeneratedPasswordDialog
          open
          password={generatedPassword}
          onClose={handlePasswordDialogClose}
        />
      )}
    </>
  );
};

export default DoctorForm;
