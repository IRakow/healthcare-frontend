// File: src/components/layout/AdminLayoutGlass.tsx

import React, { ReactNode, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBrandingContext } from '@/contexts/BrandingProvider';
import AssistantBar from '@/components/assistant/AssistantBar';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  Shield,
  Database,
  Users,
  Radio,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'employers', label: 'Employers', icon: Building2, path: '/admin/employers' },
  { id: 'billing', label: 'Billing', icon: CreditCard, path: '/admin/billing' },
  { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { id: 'audit', label: 'Audit Log', icon: Shield, path: '/admin/audit' },
  { id: 'broadcast', label: 'Broadcast', icon: Radio, path: '/admin/broadcast' },
  { id: 'backup', label: 'Backup', icon: Database, path: '/admin/backup' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' }
];

export default function AdminLayoutGlass({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { branding } = useBrandingContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (branding?.voice_profile) {
      console.log('[AdminLayoutGlass] Voice profile loaded:', branding.voice_profile);
    }
  }, [branding]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className={`bg-gradient-to-br from-white to-sky-50 text-gray-800 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <FileText className="h-6 w-6 text-blue-500" />
            {!isCollapsed && <span className="text-lg font-semibold">Admin Panel</span>}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-gray-700 hover:text-blue-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              {!isCollapsed && <div className="flex-1 text-left font-medium">{item.label}</div>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-all"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      <AssistantBar role="admin" />
    </div>
  );
}