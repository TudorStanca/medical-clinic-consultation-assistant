import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import useAuth from "@/auth/useAuth";
import ErrorBanner from "@/shared/components/ErrorBanner";
import MediScribeLogo from "@/shared/components/MediScribeLogo";
import { extractErrorMessages } from "@/core/errorMessages";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";

const T = MS_LIGHT;

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
        background: T.bg,
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 380,
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: "16px",
          p: "40px 36px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: "28px" }}>
          <MediScribeLogo size={32} color={T.text} accent={T.accent} />
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontFamily: MS_FONTS.serif,
            fontWeight: 400,
            fontSize: "1.75rem",
            letterSpacing: -0.4,
            color: T.text,
            mb: "6px",
            textAlign: "center",
          }}
        >
          Bun venit
        </Typography>
        <Typography
          sx={{
            fontSize: "0.875rem",
            color: T.textMuted,
            textAlign: "center",
            mb: "28px",
            lineHeight: 1.5,
          }}
        >
          Autentifică-te pentru a continua în MediScribe
        </Typography>

        <ErrorBanner messages={errors} />

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            size="large"
            sx={{ mt: "4px", py: "12px", fontSize: "0.9375rem" }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Autentificare"}
          </Button>
        </Box>

        <Typography sx={{ fontSize: "0.75rem", color: T.textDim, textAlign: "center", mt: "20px", lineHeight: 1.5 }}>
          Ai probleme cu autentificarea? Contactează administratorul clinicii.
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
