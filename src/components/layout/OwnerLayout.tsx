import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  BarChart2,
  Users,
  FileText,
  LogOut,
  DollarSign,
  TrendingUp,
  Settings,
  CreditCard,
  FileBarChart,
  Menu,
  X,
  Briefcase,
  Receipt,
  Calendar,
  Shield
} from 'lucide-react';
import AssistantBar from '@/components/assistant/AssistantBar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';

interface OwnerLayoutProps {
  children: ReactNode;
}

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { name } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { href: '/owner', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/owner/organizations', label: 'Organizations', icon: Building2 },
    { href: '/owner/employers', label: 'Employers', icon: Users },
    { href: '/owner/billing', label: 'Billing Configuration', icon: CreditCard },
    { href: '/owner/invoices', label: 'Invoices', icon: Receipt },
    { href: '/owner/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/owner/financial', label: 'Financial Reports', icon: FileBarChart },
    { href: '/owner/contracts', label: 'Contracts', icon: FileText },
    { href: '/owner/compliance', label: 'Compliance', icon: Shield },
    { href: '/owner/calendar', label: 'Calendar', icon: Calendar },
    { href: '/owner/settings', label: 'Settings', icon: Settings }
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-fuchsia-50 dark:from-zinc-900 dark:to-black flex">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        border-r bg-white/80 backdrop-blur dark:bg-zinc-900/80 p-4 space-y-6
      `}>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-fuchsia-600" />
            Owner Portal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Business Management
          </p>
        </div>

        <nav className="space-y-1">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact 
              ? location.pathname === href
              : location.pathname === href || 
                (href !== '/owner' && location.pathname.startsWith(href));
            
            return (
              <Link
                key={href}
                to={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/20 dark:text-fuchsia-400 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Business Stats */}
        <div className="border-t pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Orgs</span>
              <span className="font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                12
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Monthly Revenue</span>
              <span className="font-medium flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-600" />
                $45.2K
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <div className="text-xs text-muted-foreground">
            Logged in as: <span className="font-medium">{name || 'Business Owner'}</span>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 pb-32 pt-16 md:pt-4 px-4 sm:px-6 md:px-8 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
        <AssistantBar role="owner" />
      </div>
    </div>
  );
}