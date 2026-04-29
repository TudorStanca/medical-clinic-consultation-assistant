import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Box, CircularProgress, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider } from "@/auth/AuthContext";
import { RecordingProvider } from "@/consultation/RecordingContext";

const theme = createTheme();

const Loader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
    <CircularProgress />
  </Box>
);

const RootLayout = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <RecordingProvider>
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </RecordingProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default RootLayout;
