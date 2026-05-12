import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";

const T = MS_LIGHT;

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        gap: "20px",
        textAlign: "center",
        px: "24px",
      }}
    >
      <Typography
        sx={{
          fontSize: "7rem",
          fontWeight: 700,
          color: T.border,
          fontFamily: MS_FONTS.sans,
          lineHeight: 1,
          letterSpacing: "-4px",
          userSelect: "none",
        }}
      >
        404
      </Typography>
      <Typography
        sx={{
          fontFamily: MS_FONTS.serif,
          fontSize: "1.75rem",
          color: T.text,
          fontWeight: 500,
          letterSpacing: "-0.3px",
        }}
      >
        Pagina nu a fost găsită
      </Typography>
      <Typography
        sx={{
          color: T.textMuted,
          maxWidth: "360px",
          fontSize: "0.9rem",
          lineHeight: 1.6,
        }}
      >
        Adresa accesată nu există sau a fost mutată. Verificați URL-ul sau întoarceți-vă la pagina principală.
      </Typography>
      <Button
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={() => navigate("/")}
        sx={{ mt: "4px" }}
      >
        Înapoi acasă
      </Button>
    </Box>
  );
};

export default NotFoundPage;
