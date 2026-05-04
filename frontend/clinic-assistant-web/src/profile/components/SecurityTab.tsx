import { useState } from "react";
import { Box, Snackbar } from "@mui/material";
import ChangePasswordForm from "@/auth/components/ChangePasswordForm";

const SecurityTab = () => {
  const [success, setSuccess] = useState(false);

  return (
    <>
      <Box sx={{ maxWidth: 480 }}>
        <ChangePasswordForm onSuccess={() => setSuccess(true)} />
      </Box>
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        message="Parola a fost schimbată cu succes."
      />
    </>
  );
};

export default SecurityTab;
