import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { 
  Menu, 
  X, 
  Home, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  User,
  Activity,
  Video,
  Stethoscope,
  DollarSign,
  Users
} from 'lucide-react';

interface HeaderProps {
  role?: 'patient' | 'provider' | 'admin' | 'owner';
  userName?: string;
}

export function Header({ role, userName }: HeaderProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Role-based navigation items
  const getNavItems = () => {
    switch (role) {
      case 'patient':
        return [
          { label: 'Dashboard', href: '/patient', icon: Home },
          { label: 'Health', href: '/patient/health-dashboard', icon: Activity },
          { label: 'Appointments', href: '/patient/appointments', icon: Calendar },
          { label: 'Records', href: '/patient/records', icon: FileText },
          { label: 'Family', href: '/patient/family', icon: Users },
          { label: 'Settings', href: '/patient/settings', icon: Settings },
        ];
      case 'provider':
        return [
          { label: 'Dashboard', href: '/provider', icon: Home },
          { label: 'Calendar', href: '/provider/calendar', icon: Calendar },
          { label: 'Patients', href: '/provider/patients', icon: Users },
          { label: 'Settings', href: '/provider/settings', icon: Settings },
        ];
      case 'admin':
        return [
          { label: 'Dashboard', href: '/admin', icon: Home },
          { label: 'Employers', href: '/admin/employers', icon: Users },
          { label: 'Analytics', href: '/admin/analytics', icon: Activity },
          { label: 'AI Logs', href: '/admin/ai-logs', icon: FileText },
          { label: 'Settings', href: '/admin/settings', icon: Settings },
        ];
      case 'owner':
        return [
          { label: 'Dashboard', href: '/owner', icon: Home },
          { label: 'Invoices', href: '/owner/invoices', icon: DollarSign },
          { label: 'Reports', href: '/owner/reports', icon: FileText },
          { label: 'Settings', href: '/owner/settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center space-x-3">
        <Logo animate />
        <h1 className="text-xl font-bold tracking-tight">
          INSPERITY HEALTH <span className="text-blue-500">AI</span>
        </h1>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.href)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
        
        {/* User Menu */}
        {userName && (
          <div className="flex items-center gap-2 ml-4 pl-4 border-l">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{userName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg md:hidden">
          <nav className="flex flex-col p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2 w-full"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
            
            {userName && (
              <>
                <div className="border-t mt-2 pt-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{userName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="justify-start gap-2 w-full text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}