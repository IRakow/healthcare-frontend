import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import { RoleGuard } from './RoleGuard';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  roles,
  requireAuth = true 
}: ProtectedRouteProps) {
  const user = useUser();
  const location = useLocation();

  // If authentication is required and no user, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, use RoleGuard
  if (roles && roles.length > 0) {
    return (
      <RoleGuard roles={roles}>
        {children}
      </RoleGuard>
    );
  }

  // Otherwise, render children
  return <>{children}</>;
}