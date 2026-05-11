import { Box } from "@mui/material";
import ChangePasswordForm from "@/auth/components/ChangePasswordForm";

const SecurityTab = () => (
  <Box sx={{ maxWidth: 480 }}>
    <ChangePasswordForm />
  </Box>
);

export default SecurityTab;
