import { useUser } from '@supabase/auth-helpers-react';

export type UserRole = 'admin' | 'owner' | 'employer' | 'patient' | null;

export function useRole(): {
  role: UserRole;
  isAdmin: boolean;
  isOwner: boolean;
  isEmployer: boolean;
  isPatient: boolean;
  hasRole: (roles: string[]) => boolean;
} {
  const user = useUser();
  const role = (user?.user_metadata?.role || null) as UserRole;

  return {
    role,
    isAdmin: role === 'admin',
    isOwner: role === 'owner',
    isEmployer: role === 'employer',
    isPatient: role === 'patient',
    hasRole: (roles: string[]) => role !== null && roles.includes(role),
  };
}