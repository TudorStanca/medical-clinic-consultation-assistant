import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import useAuth from "@/auth/useAuth";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
      }}
    >
      <Paper sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" mb={3}>
          Asistent Consultații
        </Typography>
        <ErrorBanner messages={errors} />
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoComplete="email"
          />
          <TextField
            label="Parolă"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="current-password"
          />
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : "Autentificare"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
