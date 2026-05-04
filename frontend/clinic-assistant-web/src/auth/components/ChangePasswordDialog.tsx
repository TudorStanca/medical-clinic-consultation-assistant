import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar } from "@mui/material";
import ChangePasswordForm from "@/auth/components/ChangePasswordForm";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordDialog = ({ open, onClose }: Props) => {
  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    onClose();
    setSuccess(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Schimbă parola</DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          <ChangePasswordForm onSuccess={handleSuccess} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Anulează</Button>
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
