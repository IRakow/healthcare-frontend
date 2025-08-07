// File: src/hooks/useUserRole.ts
import { useLocation } from 'react-router-dom';

export function useUserRole(): 'admin' | 'owner' | 'patient' | 'provider' {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/owner')) return 'owner';
  if (pathname.startsWith('/provider')) return 'provider';
  return 'patient';
}