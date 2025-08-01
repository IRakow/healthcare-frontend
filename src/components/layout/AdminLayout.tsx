// File: src/components/layout/AdminLayout.tsx

import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  FileText,
  Calendar,
  Building2,
  FileClock,
  Menu,
  X,
  ShieldCheck,
  Cpu,
  Server,
  FileBarChart2,
  Shield,
  ClipboardList,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/employers', label: 'Employers', icon: Building2 },
  { href: '/admin/billing', label: 'Billing', icon: FileText },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin/audit', label: 'Audit Logs', icon: FileClock },
  { href: '/admin/audit-dashboard', label: 'Audit Dashboard', icon: ShieldCheck },
  { href: '/admin/ai-logs', label: 'AI Logs', icon: Cpu },
  { href: '/admin/backup', label: 'Backup', icon: Server },
  { href: '/admin/settings', label: 'Settings', icon: Settings }
];

const advancedLinks = [
  { href: '/admin/compliance', label: 'Compliance', icon: Shield },
  { href: '/admin/superpanel', label: 'SuperPanel', icon: ClipboardList },
  { href: '/admin/chart-dashboard', label: 'Chart Dashboard', icon: FileBarChart2 },
  { href: '/admin/chart-logs', label: 'Chart Logs', icon: FileClock },
  { href: '/admin/chart-export', label: 'Chart Export', icon: FileText }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandAdvanced, setExpandAdvanced] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-50 flex">
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
          <h2 className="text-xl font-bold text-sky-800 mb-1">Admin Panel</h2>
          <p className="text-sm text-gray-500">System Control Center</p>
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

          {/* Advanced Tools Expandable Section */}
          <button
            onClick={() => setExpandAdvanced(!expandAdvanced)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-50 rounded-lg transition"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Advanced Tools
            </span>
            {expandAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {expandAdvanced && (
            <div className="pl-5 space-y-1">
              {advancedLinks.map(({ href, label, icon: Icon }) => {
                const isActive = location.pathname === href || location.pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm
                      ${isActive ? 'bg-sky-100 text-sky-800' : 'text-gray-700 hover:bg-sky-50'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
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
    </div>
  );
}
