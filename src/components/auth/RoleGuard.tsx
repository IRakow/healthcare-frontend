import { useUser } from '@supabase/auth-helpers-react';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';
import { auditService } from '@/services/auditService';

interface RoleGuardProps {
  children: ReactNode;
  roles: string[];
  redirectTo?: string;
}

export function RoleGuard({ 
  children, 
  roles, 
  redirectTo = '/unauthorized' 
}: RoleGuardProps) {
  const user = useUser();
  const role = user?.user_metadata?.role;
  const location = useLocation();

  useEffect(() => {
    // Log permission denial if user doesn't have required role
    if (user && (!role || !roles.includes(role))) {
      auditService.logPermissionDenied(location.pathname, `Required roles: ${roles.join(', ')}, User role: ${role || 'none'}`);
    }
  }, [user, role, roles, location.pathname]);

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user doesn't have required role, redirect
  if (!role || !roles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}