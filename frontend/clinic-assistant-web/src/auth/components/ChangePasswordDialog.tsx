import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
} from "@mui/material";
import useAuthApi from "@/auth/useAuthApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordDialog = ({ open, onClose }: Props) => {
  const { changePassword } = useAuthApi();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors([]);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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

  const handleSubmit = async () => {
    const clientErrors = validate();
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);
    setErrors([]);
    try {
      await changePassword({ currentPassword, newPassword });
      reset();
      onClose();
      setSuccess(true);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Schimbă parola</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Anulează
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            Salvează
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        message="Parola a fost schimbată cu succes."
      />
    </>
  );
};

export default ChangePasswordDialog;
