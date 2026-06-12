import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import usePatientApi from "@/patients/usePatientApi";
import GeneratedPasswordDialog from "@/patients/components/GeneratedPasswordDialog";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { generatePassword } from "@/patients/utils/generatePassword";
import { extractErrorMessages } from "@/core/errorMessages";
import { Sex, SexLabels } from "@/shared/types/enums";
import type { SexValue } from "@/shared/types/enums";
import type { PatientResponseDTO } from "@/patients/props";

interface Props {
  onCreated: (patient: PatientResponseDTO) => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const PatientForm = ({ onCreated, onDirtyChange }: Props) => {
  const { createPatient } = usePatientApi();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [createdPatient, setCreatedPatient] = useState<PatientResponseDTO | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState<SexValue>(Sex.Male);

  useEffect(() => {
    const dirty = [firstName, lastName, email, phoneNumber, identityNumber, address, birthDate].some((v) => v !== "");
    onDirtyChange?.(dirty);
  }, [firstName, lastName, email, phoneNumber, identityNumber, address, birthDate, onDirtyChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    const password = generatePassword();
    setLoading(true);
    try {
      const patient = await createPatient({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        identityNumber,
        address,
        birthDate,
        sex,
      });
      setCreatedPatient(patient);
      setGeneratedPassword(password);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordDialogClose = () => {
    if (createdPatient) {
      onCreated(createdPatient);
    }
    setGeneratedPassword(null);
    setCreatedPatient(null);
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <ErrorBanner messages={errors} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Prenume"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Nume"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            fullWidth
          />
        </Box>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Telefon"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="CNP (13 cifre)"
          value={identityNumber}
          onChange={(e) => setIdentityNumber(e.target.value)}
          required
          fullWidth
          inputProps={{ maxLength: 13, inputMode: "numeric" }}
        />
        <TextField
          label="Adresă"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Data nașterii"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <FormControl fullWidth required>
          <InputLabel>Sex</InputLabel>
          <Select value={sex} label="Sex" onChange={(e) => setSex(e.target.value as SexValue)}>
            {(Object.entries(SexLabels) as [string, string][]).map(([val, label]) => (
              <MenuItem key={val} value={Number(val)}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={22} color="inherit" /> : "Creează pacient"}
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

export default PatientForm;
