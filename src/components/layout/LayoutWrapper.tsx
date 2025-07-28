import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import PatientLayout from './PatientLayout'
import ProviderLayout from './ProviderLayout'
import OwnerLayout from './OwnerLayout'
import AdminLayout from './AdminLayout'

interface LayoutWrapperProps {
  children: ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const location = useLocation()
  const path = location.pathname

  // Determine which layout to use based on the route
  if (path.startsWith('/patient')) {
    return <PatientLayout>{children}</PatientLayout>
  } else if (path.startsWith('/provider')) {
    return <ProviderLayout>{children}</ProviderLayout>
  } else if (path.startsWith('/owner')) {
    return <OwnerLayout>{children}</OwnerLayout>
  } else if (path.startsWith('/admin')) {
    return <AdminLayout>{children}</AdminLayout>
  }

  // Default: no layout wrapper (for public pages)
  return <>{children}</>
}