import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import ProtectedRoute from "@/auth/ProtectedRoute";
import AppLayout from "@/layout/AppLayout";
import LoginPage from "@/auth/LoginPage";

const DashboardPage = lazy(() => import("@/dashboard/pages/DashboardPage"));
const ConsultationListPage = lazy(() => import("@/consultation/pages/ConsultationListPage"));
const NewConsultationPage = lazy(() => import("@/consultation/pages/NewConsultationPage"));
const ConsultationPage = lazy(() => import("@/consultation/pages/ConsultationPage"));
const PatientsListPage = lazy(() => import("@/patients/pages/PatientsListPage"));
const NewPatientPage = lazy(() => import("@/patients/pages/NewPatientPage"));
const PatientDetailPage = lazy(() => import("@/patients/pages/PatientDetailPage"));
const DoctorsListPage = lazy(() => import("@/doctors/pages/DoctorsListPage"));
const NewDoctorPage = lazy(() => import("@/doctors/pages/NewDoctorPage"));

const Loader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
    <CircularProgress />
  </Box>
);

const AppRoutes = () => (
  <Suspense fallback={<Loader />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/consultations" element={<ConsultationListPage />} />
          <Route path="/consultations/new" element={<ProtectedRoute allowedRoles={["Doctor"]} />}>
            <Route index element={<NewConsultationPage />} />
          </Route>
          <Route path="/consultations/:sessionId" element={<ConsultationPage />} />
          <Route element={<ProtectedRoute allowedRoles={["Doctor", "Admin"]} />}>
            <Route path="/patients" element={<PatientsListPage />} />
            <Route path="/patients/new" element={<NewPatientPage />} />
          </Route>
          <Route path="/patients/:id" element={<PatientDetailPage />} />
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/doctors" element={<DoctorsListPage />} />
            <Route path="/doctors/new" element={<NewDoctorPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  </Suspense>
);

export default AppRoutes;
