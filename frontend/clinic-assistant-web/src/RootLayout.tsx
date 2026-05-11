import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Box, CircularProgress, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider } from "@/auth/AuthContext";
import { RecordingProvider } from "@/consultation/RecordingContext";
import { NotificationProvider } from "@/shared/NotificationContext";

const theme = createTheme();

const Loader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
    <CircularProgress />
  </Box>
);

const RootLayout = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <NotificationProvider>
      <AuthProvider>
        <RecordingProvider>
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </RecordingProvider>
      </AuthProvider>
    </NotificationProvider>
  </ThemeProvider>
);

export default RootLayout;
