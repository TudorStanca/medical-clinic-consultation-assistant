import { useState } from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import useAuthApi from "@/auth/useAuthApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";

interface Props {
  onSuccess?: () => void;
}

const ChangePasswordForm = ({ onSuccess }: Props) => {
  const { changePassword } = useAuthApi();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!currentPassword) {
      errs.push("Parola curentă este obligatorie.");
    }
    if (newPassword.length < 6) {
      errs.push("Parola nouă trebuie să aibă cel puțin 6 caractere.");
    }
    if (newPassword !== confirmPassword) {
      errs.push("Parola nouă și confirmarea nu se potrivesc.");
    }
    if (newPassword === currentPassword && newPassword.length > 0) {
      errs.push("Parola nouă trebuie să fie diferită de parola curentă.");
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validate();
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);
    setErrors([]);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onSuccess?.();
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <ErrorBanner messages={errors} />
      <TextField
        label="Parola curentă"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        fullWidth
        autoComplete="current-password"
      />
      <TextField
        label="Parola nouă"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        fullWidth
        autoComplete="new-password"
      />
      <TextField
        label="Confirmă parola nouă"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
        autoComplete="new-password"
      />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? <CircularProgress size={22} color="inherit" /> : "Schimbă parola"}
      </Button>
    </Box>
  );
};

export default ChangePasswordForm;
