// File: src/components/layout/SecureLayout.tsx
import { useUser } from '@/hooks/useUser'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export function SecureLayout({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { role, loading } = useUser()
  const navigate = useNavigate()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (loading) return
    
    if (!role) {
      navigate('/login')
    } else if (!allowedRoles.includes(role)) {
      navigate('/unauthorized')
    } else {
      setAuthorized(true)
    }
  }, [role, loading, allowedRoles, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <>
      {authorized ? children : <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-white p-6">Verifying access...</div></div>}
    </>
  )
}