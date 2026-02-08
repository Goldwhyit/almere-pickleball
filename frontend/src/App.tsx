import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AdminBranding } from "./admin/AdminBranding";
import { AdminPhotos } from "./admin/AdminPhotos";
import { AdminSponsors } from "./admin/AdminSponsors";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminApprovals } from "./pages/AdminApprovals";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminMembers } from "./pages/AdminMembers";
import { AdminPayments } from "./pages/AdminPayments";
import { AdminPlaydays } from "./pages/AdminPlaydays";
import AdminPlaydaysDetail from "./pages/AdminPlaydaysDetail";
import { AdminProfile } from "./pages/AdminProfile";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { MemberDashboard } from "./pages/MemberDashboard";
import { TrialDashboard } from "./pages/TrialDashboard";
import { TrialSignup } from "./pages/TrialSignup";
import { WordLid } from "./pages/WordLid";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/trial-signup" element={<TrialSignup />} />
        <Route path="/word-lid" element={<WordLid />} />
        <Route
          path="/trial-dashboard"
          element={
            <ProtectedRoute requiredAccountType="TRIAL">
              <TrialDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredAccountType={["MEMBER", "TRIAL_EXPIRED"]}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredAccountType="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute requiredAccountType="ADMIN">
              <AdminMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute requiredAccountType="ADMIN">
              <AdminApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute requiredAccountType="ADMIN">
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/playdays"
          element={
            <ProtectedRoute requiredAccountType="ADMIN">
              <AdminPlaydays />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/playdays/registrations"
          element={
            <ProtectedRoute requiredAccountType="ADMIN">
              <AdminPlaydaysDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute requiredAccountType="ADMIN">
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/photos"
          element={
            <ProtectedRoute requiredAccountType="ADMIN">
              <AdminPhotos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/branding"
          element={
            <ProtectedRoute requiredAccountType="ADMIN">
              <AdminBranding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sponsors"
          element={
            <ProtectedRoute requiredAccountType="ADMIN">
              <AdminSponsors />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
