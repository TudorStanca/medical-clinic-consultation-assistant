import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PeopleIcon from "@mui/icons-material/People";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import useAuth from "@/auth/useAuth";
import { Roles } from "@/shared/types/enums";

interface DashCard {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const CARDS: DashCard[] = [
  { label: "Consultație nouă", path: "/consultations/new", icon: <AddCircleIcon fontSize="large" />, roles: [Roles.Doctor] },
  { label: "Consultațiile mele", path: "/consultations", icon: <ListAltIcon fontSize="large" />, roles: [Roles.Doctor, Roles.Patient, Roles.Admin] },
  { label: "Pacienți", path: "/patients", icon: <PeopleIcon fontSize="large" />, roles: [Roles.Doctor, Roles.Admin] },
  { label: "Doctori", path: "/doctors", icon: <MedicalServicesIcon fontSize="large" />, roles: [Roles.Admin] },
];

const DashboardPage = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  const visibleCards = CARDS.filter((c) => c.roles.some(hasRole));

  return (
    <Box>
      <Typography variant="h5" mb={3}>
        Bun venit, {user?.firstName}!
      </Typography>
      <Grid container spacing={2}>
        {visibleCards.map((card) => (
          <Grid key={card.path} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover" },
              }}
              onClick={() => navigate(card.path)}
            >
              {card.icon}
              <Typography variant="subtitle1">{card.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      {visibleCards.length === 0 && (
        <Button variant="outlined" onClick={() => navigate("/consultations")}>
          Consultațiile mele
        </Button>
      )}
    </Box>
  );
};

export default DashboardPage;
