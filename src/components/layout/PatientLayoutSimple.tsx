import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

export default function PatientLayoutSimple({ children }: PatientLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-emerald-50 flex">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-200 ease-in-out
        w-72 bg-white/90 backdrop-blur-md shadow-lg border-r border-gray-200
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">John Doe</h3>
              <p className="text-xs text-gray-500">Patient Portal</p>
            </div>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const isActive = location.pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0">
        <div className="lg:pl-4">
          {children}
        </div>
      </main>
    </div>
  );
}