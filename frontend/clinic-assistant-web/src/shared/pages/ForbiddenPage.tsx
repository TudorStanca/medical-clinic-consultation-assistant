import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";

const T = MS_LIGHT;

const ForbiddenPage = () => {
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
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: T.dangerSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 40, color: T.danger }} />
      </Box>
      <Typography
        sx={{
          fontFamily: MS_FONTS.serif,
          fontSize: "1.75rem",
          color: T.text,
          fontWeight: 500,
          letterSpacing: "-0.3px",
        }}
      >
        Acces interzis
      </Typography>
      <Typography
        sx={{
          color: T.textMuted,
          maxWidth: "360px",
          fontSize: "0.9rem",
          lineHeight: 1.6,
        }}
      >
        Nu aveți permisiunile necesare pentru a accesa această pagină.
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

export default ForbiddenPage;
