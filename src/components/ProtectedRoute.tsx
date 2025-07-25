import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  allowGuest?: boolean
}

export function ProtectedRoute({ children, redirectTo = '/patient/login', allowGuest = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If guest access is allowed, render children regardless of auth status
  if (allowGuest) {
    return <>{children}</>
  }

  // Otherwise, redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}