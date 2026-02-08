import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredAccountType?: string | string[];
}

export const ProtectedRoute = ({
  children,
  requiredAccountType,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Convert to array for easier checking
  const allowedTypes = Array.isArray(requiredAccountType)
    ? requiredAccountType
    : requiredAccountType
    ? [requiredAccountType]
    : [];

  if (
    allowedTypes.length > 0 &&
    !allowedTypes.includes(user?.member?.accountType || '')
  ) {
    // Route to appropriate dashboard based on account type
    const accountType = user?.member?.accountType;
    const fallbackPath =
      accountType === 'TRIAL'
        ? '/trial-dashboard'
        : accountType === 'ADMIN'
        ? '/admin'
        : '/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
