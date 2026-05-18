import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ChangePasswordForm from "@/auth/components/ChangePasswordForm";
import { MS_LIGHT } from "@/theme/tokens";

const T = MS_LIGHT;

interface Props {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordDialog = ({ open, onClose }: Props) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <LockOutlinedIcon sx={{ fontSize: 20, color: T.accent }} />
        Schimbă parola
      </Box>
    </DialogTitle>
    <DialogContent sx={{ pt: "8px !important" }}>
      <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted, mb: "16px" }}>
        Introduceți parola curentă și noua parolă dorită.
      </Typography>
      <ChangePasswordForm onSuccess={onClose} />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Anulează</Button>
    </DialogActions>
  </Dialog>
);

export default ChangePasswordDialog;
