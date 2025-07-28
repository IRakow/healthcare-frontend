import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/hooks/useUser'
import { redirectByRole } from '@/utils/redirectByRole'

export function useRoleGuard(requiredRole: string) {
  const { role, loading } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!role) {
        // No user logged in, redirect to login
        navigate('/login')
      } else if (role !== requiredRole) {
        // User has wrong role, redirect to their dashboard
        navigate(redirectByRole(role))
      }
    }
  }, [role, requiredRole, loading, navigate])

  return { role, loading }
}