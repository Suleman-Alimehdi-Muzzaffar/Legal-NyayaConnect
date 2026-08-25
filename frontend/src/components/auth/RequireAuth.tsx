import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@workspace/api-client-react';

interface RequireAuthProps {
  role: UserRole;
  children: React.ReactNode;
}

export function RequireAuth({ role, children }: RequireAuthProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.role !== role) {
    const home = user?.role === 'lawyer' ? '/lawyer-dashboard' : '/dashboard';
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
