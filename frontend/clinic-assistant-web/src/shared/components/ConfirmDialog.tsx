import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog = ({ open, title, message, confirmLabel = "Confirmare", onConfirm, onClose }: Props) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{message}</DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Anulare</Button>
      <Button onClick={onConfirm} color="error" variant="contained">
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
