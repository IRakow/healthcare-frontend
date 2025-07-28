import React, { ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';

interface RoleBasedAccessProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({ allowedRoles, children, fallback = null }) => {
  const { role } = useUser();

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};