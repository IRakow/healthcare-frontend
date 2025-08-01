// File: src/components/layout/AdminLayoutGlassy.tsx

import React, { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, CreditCard, Settings, Shield, Database,
  Users, Radio, LogOut, ChevronLeft, ChevronRight, FileText, BarChart3
} from 'lucide-react';
import HolographicLogo from '@/components/ui/HolographicLogo';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', desc: 'Overview & stats' },
  { id: 'employers', label: 'Employers', icon: Building2, path: '/admin/employers', desc: 'Manage organizations' },
  { id: 'billing', label: 'Billing', icon: CreditCard, path: '/admin/billing', desc: 'Invoices & payments' },
  { id: 'users', label: 'Users', icon: Users, path: '/admin/users', desc: 'Providers & patients' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics', desc: 'Reports & insights' },
  { id: 'audit', label: 'Audit Log', icon: Shield, path: '/admin/audit', desc: 'Security & activity' },
  { id: 'broadcast', label: 'Broadcast', icon: Radio, path: '/admin/broadcast', desc: 'Mass messaging' },
  { id: 'backup', label: 'Backup', icon: Database, path: '/admin/backup', desc: 'Data exports' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings', desc: 'Platform config' }
];

export default function AdminLayoutGlassy({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex">
      <HolographicLogo />

      {/* Sidebar */}
      <aside className={`transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-72'} bg-white/70 backdrop-blur-md shadow-xl border-r border-gray-200`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="text-sky-600 w-6 h-6" />
            {!collapsed && <span className="font-semibold text-sky-800 text-lg">Admin Panel</span>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                  isActive ? 'bg-sky-100 text-sky-800' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && (
                  <div>
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={() => navigate('/')}
            className="w-full flex gap-2 items-center px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}