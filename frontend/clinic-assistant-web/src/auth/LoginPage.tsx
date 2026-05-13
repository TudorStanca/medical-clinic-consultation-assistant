import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
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
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        background: T.bg,
      }}
    >
      {/* Brand panel — hidden on mobile */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(160deg, ${T.accent} 0%, ${T.accentInk} 100%)`,
          p: "56px 64px",
        }}
      >
        {/* Decorative wave */}
        <Box
          component="svg"
          viewBox="0 0 800 600"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.12,
            pointerEvents: "none",
          }}
        >
          <path
            d="M0 300 Q100 150 200 300 T400 300 T600 300 T800 300 V600 H0 Z"
            fill="white"
          />
          <path
            d="M0 400 Q100 250 200 400 T400 400 T600 400 T800 400 V600 H0 Z"
            fill="white"
          />
        </Box>

        {/* Logo */}
        <Box sx={{ position: "relative" }}>
          <MediScribeLogo size={32} color="white" accent="rgba(255,255,255,0.3)" />
        </Box>

        {/* Tagline */}
        <Box sx={{ mt: "auto", position: "relative" }}>
          <Typography
            sx={{
              fontFamily: MS_FONTS.serif,
              fontSize: "2.5rem",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.6px",
              color: "white",
              mb: "20px",
            }}
          >
            Mai puțin scris.
            <br />
            Mai mult timp
            <br />
            cu pacientul.
          </Typography>
          <Typography
            sx={{
              fontSize: "0.9375rem",
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.6,
              maxWidth: 380,
            }}
          >
            Înregistrează consultația, AI-ul ascultă și pregătește scrisoarea medicală. Tu doar
            revizuiești și semnezi.
          </Typography>
        </Box>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: "32px 24px", md: "56px 64px" },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 380 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: "32px" }}>
            <MediScribeLogo size={30} color={T.text} accent={T.accent} />
          </Box>

          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.textMuted,
              mb: "6px",
            }}
          >
            Bun venit înapoi
          </Typography>
          <Typography
            sx={{
              fontFamily: MS_FONTS.serif,
              fontSize: "2rem",
              fontWeight: 400,
              letterSpacing: "-0.4px",
              color: T.text,
              mb: "6px",
            }}
          >
            Autentificare
          </Typography>
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: T.textMuted,
              mb: "32px",
              lineHeight: 1.5,
            }}
          >
            Folosește contul tău MediScribe pentru a continua.
          </Typography>

          <ErrorBanner messages={errors} />

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
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

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              mt: "28px",
              color: T.textDim,
              fontSize: "0.75rem",
            }}
          >
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 14 }} />
            <span>Înregistrare audio · Transcriere automată · Scrisori medicale</span>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
