// File: src/components/layout/PatientLayout.tsx

import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AssistantBar } from '@/components/ai/AssistantBar';
import {
  CalendarDays,
  FileText,
  HeartPulse,
  LayoutDashboard,
  User,
  Bot,
  Camera,
  Stethoscope,
  Bell,
  ScrollText,
  LineChart,
  Salad,
  MessageCircle,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PatientLayoutProps {
  children: ReactNode;
}

const links = [
  { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patient/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/patient/medications', label: 'Medications', icon: FileText },
  { href: '/patient/health-dashboard', label: 'Health', icon: HeartPulse },
  { href: '/patient/nutrition-log', label: 'Food Log', icon: Salad },
  { href: '/patient/timeline', label: 'Timeline', icon: ScrollText },
  { href: '/patient/scan', label: 'Camera Tools', icon: Camera },
  { href: '/patient/ai-history', label: 'AI History', icon: Bot },
  { href: '/patient/settings', label: 'Settings', icon: User },
  { href: '/patient/notifications', label: 'Notifications', icon: Bell },
];

export default function PatientLayout({ children }: PatientLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-emerald-50 flex">
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
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        bg-white/80 backdrop-blur p-6 border-r shadow-xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative md:block
      `}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-sky-800 mb-1">Patient Portal</h2>
          <p className="text-sm text-gray-500">Welcome back</p>
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
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 bg-white/60 backdrop-blur rounded-3xl shadow-inner">
        {children}
      </main>

      <AssistantBar role="patient" />
    </div>
  );
}
