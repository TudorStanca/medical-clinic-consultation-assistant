import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import useAuthApi from "@/auth/useAuthApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";

interface Props {
  open: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
}

const ResetPasswordDialog = ({ open, onClose, targetUserId, targetUserName }: Props) => {
  const { resetUserPassword } = useAuthApi();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = () => {
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
    if (newPassword.length < 6) {
      errs.push("Parola nouă trebuie să aibă cel puțin 6 caractere.");
    }
    if (newPassword !== confirmPassword) {
      errs.push("Parola nouă și confirmarea nu se potrivesc.");
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
      await resetUserPassword(targetUserId, { newPassword });
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
        <DialogTitle>Resetează parola</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <Typography variant="body2" color="text.secondary">
            Setează o parolă nouă pentru <strong>{targetUserName}</strong>.
          </Typography>
          <ErrorBanner messages={errors} />
          <TextField
            label="Parolă nouă"
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
          <Button variant="contained" color="warning" onClick={handleSubmit} disabled={loading}>
            Resetează
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        message={`Parola pentru ${targetUserName} a fost resetată.`}
      />
    </>
  );
};

export default ResetPasswordDialog;
