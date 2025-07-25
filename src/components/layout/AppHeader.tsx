import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface AppHeaderProps {
  role?: 'patient' | 'provider' | 'admin' | 'owner';
}

export function AppHeader({ role = 'patient' }: AppHeaderProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get navigation links based on role
  const getNavLinks = () => {
    const baseLinks = {
      patient: [
        { to: '/patient', label: 'Dashboard' },
        { to: '/patient/appointments', label: 'Appointments' },
        { to: '/patient/records', label: 'Records' },
        { to: '/patient/calendar', label: 'Calendar' },
        { to: '/patient/settings', label: 'Settings' },
      ],
      provider: [
        { to: '/provider', label: 'Dashboard' },
        { to: '/provider/calendar', label: 'Calendar' },
        { to: '/provider/patients', label: 'Patients' },
        { to: '/provider/settings', label: 'Settings' },
      ],
      admin: [
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/employers', label: 'Employers' },
        { to: '/admin/analytics', label: 'Analytics' },
        { to: '/admin/settings', label: 'Settings' },
      ],
      owner: [
        { to: '/owner', label: 'Dashboard' },
        { to: '/owner/invoices', label: 'Invoices' },
        { to: '/owner/reports', label: 'Reports' },
        { to: '/owner/settings', label: 'Settings' },
      ],
    };

    return baseLinks[role] || baseLinks.patient;
  };

  const navLinks = getNavLinks();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
      <Logo animate />
      
      {/* Desktop Navigation */}
      <nav className="hidden sm:flex space-x-6 text-sm text-gray-700">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`hover:text-blue-600 transition-colors ${
              isActive(link.to) ? 'text-blue-600 font-medium' : ''
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="sm:hidden p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="absolute top-full left-0 right-0 bg-white border-b shadow-lg sm:hidden">
          <div className="flex flex-col p-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm py-2 px-3 rounded hover:bg-gray-100 ${
                  isActive(link.to) ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

// Simple version without role detection
export function SimpleAppHeader() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
      <Logo animate />
      <nav className="hidden sm:flex space-x-6 text-sm text-gray-700">
        <Link 
          to="/patient" 
          className={`hover:text-blue-600 transition-colors ${
            isActive('/patient') ? 'text-blue-600 font-medium' : ''
          }`}
        >
          Dashboard
        </Link>
        <Link 
          to="/calendar"
          className={`hover:text-blue-600 transition-colors ${
            isActive('/calendar') ? 'text-blue-600 font-medium' : ''
          }`}
        >
          Calendar
        </Link>
        <Link 
          to="/settings"
          className={`hover:text-blue-600 transition-colors ${
            isActive('/settings') ? 'text-blue-600 font-medium' : ''
          }`}
        >
          Settings
        </Link>
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="sm:hidden p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="absolute top-full left-0 right-0 bg-white border-b shadow-lg sm:hidden z-50">
          <div className="flex flex-col p-4 space-y-3">
            <Link 
              to="/patient" 
              className="text-sm py-2 px-3 rounded hover:bg-gray-100 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/calendar"
              className="text-sm py-2 px-3 rounded hover:bg-gray-100 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Calendar
            </Link>
            <Link 
              to="/settings"
              className="text-sm py-2 px-3 rounded hover:bg-gray-100 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}