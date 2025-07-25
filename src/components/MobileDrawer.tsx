import { useState, useEffect } from 'react';
import { Menu, X, Home, Calendar, Pill, Users, FileText, TrendingUp, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Route {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const role = user?.user_metadata?.role || 'patient';

  const routes: Record<string, Route[]> = {
    admin: [
      { to: '/admin', label: 'Dashboard', icon: Home },
      { to: '/admin/employers', label: 'Employers', icon: Users },
      { to: '/admin/invoices', label: 'Invoices', icon: FileText },
      { to: '/admin/audit', label: 'Audit Logs', icon: FileText },
      { to: '/admin/calendar', label: 'Calendar', icon: Calendar },
    ],
    provider: [
      { to: '/provider', label: 'Dashboard', icon: Home },
      { to: '/provider/calendar', label: 'Schedule', icon: Calendar },
    ],
    patient: [
      { to: '/patient', label: 'Home', icon: Home },
      { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
      { to: '/patient/medications', label: 'Medications', icon: Pill },
      { to: '/patient/labs', label: 'Lab Results', icon: FileText },
      { to: '/patient/calendar', label: 'Calendar', icon: Calendar },
      { to: '/patient/settings', label: 'Settings', icon: Settings },
    ],
    owner: [
      { to: '/owner', label: 'Dashboard', icon: Home },
      { to: '/employer/analytics', label: 'Analytics', icon: TrendingUp },
      { to: '/owner/invoices', label: 'Invoices', icon: FileText },
      { to: '/owner/calendar', label: 'Calendar', icon: Calendar },
      { to: '/employer/branding', label: 'Branding', icon: Settings },
    ],
  };

  const currentRoutes = routes[role] || routes.patient;

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
    setOpen(false);
  }

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'sm:hidden fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Menu</h2>
              <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {currentRoutes.map((route, i) => {
            const Icon = route.icon;
            const isActive = isActiveRoute(route.to);
            
            return (
              <Link
                key={i}
                to={route.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{route.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}