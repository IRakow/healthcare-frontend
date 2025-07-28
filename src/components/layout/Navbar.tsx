// File: src/components/layout/Navbar.tsx
import { Link, useLocation } from 'react-router-dom'
import { PanelSwitcher } from '@/components/owner/PanelSwitcher'

export function Navbar() {
  const location = useLocation()
  
  // Determine role based on current path
  const getCurrentRole = () => {
    const path = location.pathname
    if (path.startsWith('/admin')) return 'admin'
    if (path.startsWith('/owner')) return 'owner'
    if (path.startsWith('/provider')) return 'provider'
    if (path.startsWith('/patient')) return 'patient'
    return null
  }
  
  const role = getCurrentRole()

  return (
    <nav className="w-full bg-background/80 backdrop-blur border-b border-white/10 p-4 flex justify-between items-center text-white z-50">
      <Link to="/" className="flex items-center gap-2">
        {/* AnimatedLogo placeholder - component needs to be created */}
        <span className="font-bold text-white">Insperity Health AI</span>
      </Link>
      <div className="flex gap-6 text-sm items-center">
        {role === 'admin' && <Link to="/admin/dashboard">Admin Portal</Link>}
        {role === 'owner' && (
          <>
            <Link to="/owner/dashboard">Owner Portal</Link>
            <PanelSwitcher />
          </>
        )}
        {role === 'provider' && <Link to="/provider/dashboard">Provider Portal</Link>}
        {role === 'patient' && <Link to="/patient/dashboard">Patient Portal</Link>}
        {!role && (
          <>
            <Link to="/patient/dashboard">Patient</Link>
            <Link to="/provider/dashboard">Provider</Link>
            <Link to="/owner/dashboard">Owner</Link>
            <Link to="/admin/dashboard">Admin</Link>
          </>
        )}
      </div>
    </nav>
  )
}