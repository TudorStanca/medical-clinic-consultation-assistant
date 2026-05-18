import { Box } from "@mui/material";
import ChangePasswordForm from "@/auth/components/ChangePasswordForm";

const SecurityTab = () => (
  <Box sx={{ maxWidth: 480, mx: "auto" }}>
    <ChangePasswordForm />
  </Box>
);

export default SecurityTab;
