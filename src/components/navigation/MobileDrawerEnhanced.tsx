import { useState, useEffect, useRef } from 'react';
import { Menu, X, Home, Building2, FileText, Palette, DollarSign, BarChart3, Settings, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/owner', icon: <Home className="w-4 h-4" /> },
  { label: 'Employers', path: '/owner/employers', icon: <Building2 className="w-4 h-4" /> },
  { label: 'Invoices', path: '/owner/invoices', icon: <FileText className="w-4 h-4" /> },
  { label: 'Invoice Admin', path: '/owner/invoice-admin', icon: <FileText className="w-4 h-4" /> },
  { label: 'Payouts', path: '/owner/payouts', icon: <DollarSign className="w-4 h-4" /> },
  { label: 'Reports', path: '/owner/reports', icon: <BarChart3 className="w-4 h-4" /> },
  { label: 'Spending Trends', path: '/owner/spending-trends', icon: <BarChart3 className="w-4 h-4" /> },
  { label: 'Branding', path: '/owner/branding', icon: <Palette className="w-4 h-4" /> },
  { label: 'Voice Settings', path: '/owner/voice-selector', icon: <Settings className="w-4 h-4" /> },
];

export function MobileDrawerEnhanced() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);
  const { role, hasRole } = useRole();

  // Close drawer when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || hasRole(item.roles)
  );

  return (
    <div ref={drawerRef} className="sm:hidden fixed top-4 left-4 z-50">
      <button 
        onClick={() => setOpen(!open)}
        className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25" 
            onClick={() => setOpen(false)}
          />
          
          {/* Drawer */}
          <div className="absolute top-14 left-0 w-72 bg-white rounded-xl shadow-xl overflow-hidden animate-slide-in">
            {/* User info */}
            <div className="p-4 bg-gray-50 border-b">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-semibold capitalize">{role || 'User'}</p>
            </div>
            
            {/* Menu items */}
            <nav className="p-2">
              {filteredMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            
            {/* Logout button */}
            <div className="p-2 border-t mt-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}