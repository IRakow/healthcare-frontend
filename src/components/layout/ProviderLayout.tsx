// File: src/components/layout/ProviderLayout.tsx

import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AssistantBar from '@/components/assistant/AssistantBar';
import {
  CalendarDays,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Activity,
  FlaskConical,
  MessageSquare,
  Settings,
  Users,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';

interface ProviderLayoutProps {
  children: ReactNode;
}

const links = [
  { href: '/provider', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/provider/visits', label: 'Visits', icon: CalendarDays },
  { href: '/provider/patients', label: 'Patients', icon: Users },
  { href: '/provider/soap', label: 'SOAP Notes', icon: FileText },
  { href: '/provider/labs', label: 'Lab Results', icon: FlaskConical },
  { href: '/provider/risk-flags', label: 'Risk Flags', icon: HeartPulse },
  { href: '/provider/video', label: 'Telehealth', icon: Activity },
  { href: '/provider/messages/inbox', label: 'Messages', icon: MessageSquare },
  { href: '/provider/settings', label: 'Settings', icon: Settings }
];

export default function ProviderLayout({ children }: ProviderLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { name } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-sky-50 flex">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        bg-white/80 backdrop-blur p-6 border-r shadow-xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative md:block`}
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-sky-800 mb-1">Provider Portal</h2>
          <p className="text-sm text-gray-500">Hello, Dr. {name || 'User'}</p>
        </div>
        <nav className="space-y-2">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = location.pathname === href || location.pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                to={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm
                  ${isActive ? 'bg-sky-100 text-sky-800' : 'text-gray-700 hover:bg-sky-50'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-white/60 backdrop-blur rounded-3xl shadow-inner">
        {children}
      </main>

      <AssistantBar role="provider" />
    </div>
  );
}
