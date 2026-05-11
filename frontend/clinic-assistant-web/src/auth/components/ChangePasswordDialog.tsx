import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import ChangePasswordForm from "@/auth/components/ChangePasswordForm";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordDialog = ({ open, onClose }: Props) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Schimbă parola</DialogTitle>
    <DialogContent sx={{ pt: "16px !important" }}>
      <ChangePasswordForm onSuccess={onClose} />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Anulează</Button>
    </DialogActions>
  </Dialog>
);

export default ChangePasswordDialog;
