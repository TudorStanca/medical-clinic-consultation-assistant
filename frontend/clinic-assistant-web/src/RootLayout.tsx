import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Box, CircularProgress, CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider } from "@/auth/AuthContext";
import { RecordingProvider } from "@/consultation/RecordingContext";
import { NotificationProvider } from "@/shared/NotificationContext";
import muiTheme from "@/theme/muiTheme";

const Loader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
    <CircularProgress />
  </Box>
);

const RootLayout = () => (
  <ThemeProvider theme={muiTheme}>
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
