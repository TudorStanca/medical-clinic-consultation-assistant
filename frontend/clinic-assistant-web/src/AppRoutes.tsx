import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import ProtectedRoute from "@/auth/ProtectedRoute";
import AppLayout from "@/layout/AppLayout";
import LoginPage from "@/auth/LoginPage";
import RootLayout from "./RootLayout";

const DashboardPage = lazy(() => import("@/dashboard/pages/DashboardPage"));
const ConsultationListPage = lazy(() => import("@/consultation/pages/ConsultationListPage"));
const NewConsultationPage = lazy(() => import("@/consultation/pages/NewConsultationPage"));
const ConsultationPage = lazy(() => import("@/consultation/pages/ConsultationPage"));
const PatientsListPage = lazy(() => import("@/patients/pages/PatientsListPage"));
const NewPatientPage = lazy(() => import("@/patients/pages/NewPatientPage"));
const PatientDetailPage = lazy(() => import("@/patients/pages/PatientDetailPage"));
const DoctorsListPage = lazy(() => import("@/doctors/pages/DoctorsListPage"));
const DoctorDetailPage = lazy(() => import("@/doctors/pages/DoctorDetailPage"));
const ProfilePage = lazy(() => import("@/profile/pages/ProfilePage"));

const routeTree = (
  <Route element={<RootLayout />}>
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
          <Route path="/doctors/:id" element={<DoctorDetailPage />} />
        </Route>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Route>
  </Route>
);

export default routeTree;
