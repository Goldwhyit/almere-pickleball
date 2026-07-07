import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense } from 'react';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WordLid from './pages/WordLid';
import TrialSignup from './pages/TrialSignup';
import TrialDashboard from './pages/TrialDashboard';
import PunchCardDashboard from './pages/PunchCardDashboard';
import MonthlyDashboard from './pages/MonthlyDashboard';
import AccountPage from './pages/AccountPage';
import Onboarding from './pages/Onboarding';
import Tournaments from './pages/tournaments/Tournaments';
import TournamentDetail from './pages/tournaments/TournamentDetail';
import OrganizerDashboard from './pages/tournaments/OrganizerDashboard';
import PlayerView from './pages/tournaments/PlayerView';
import PublicBoard from './pages/tournaments/PublicBoard';
import { useAuthStore } from './stores/authStore';
import FloatingWhatsApp from './components/FloatingWhatsApp';

// Lazy load admin pages
const Matches = React.lazy(() => import('./pages/matches/Matches'));
const MembersDashboard = React.lazy(() => import('./pages/MembersDashboard'));
const CourtsDashboard = React.lazy(() => import('./pages/CourtsDashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Laden...</p>
      </div>
    </div>
  );
}

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/trial-signup" element={<TrialSignup />} />
            <Route
              path="/proeflessen"
              element={<Navigate to="/onboarding" replace state={{ mode: 'trial' }} />}
            />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/word-lid" element={<WordLid />} />
            <Route path="/memberships" element={<Navigate to="/word-lid" replace />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
            <Route path="/tournaments/:id/organizer" element={<OrganizerDashboard />} />
            <Route path="/tournaments/:id/player" element={<PlayerView />} />
            <Route path="/tournaments/:id/live" element={<PublicBoard />} />

            {/* Protected Member Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trial-dashboard"
              element={
                <ProtectedRoute>
                  <TrialDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/punch-card-dashboard"
              element={
                <ProtectedRoute>
                  <PunchCardDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/monthly-dashboard"
              element={
                <ProtectedRoute>
                  <MonthlyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/matches"
              element={
                <ProtectedRoute>
                  <Matches />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members"
              element={
                <ProtectedRoute>
                  <MembersDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courts"
              element={
                <ProtectedRoute>
                  <CourtsDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
      <FloatingWhatsApp />
    </QueryClientProvider>
  );
}

export default App;