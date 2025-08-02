import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard,
  Building2, 
  CreditCard,
  Settings,
  Shield,
  Database,
  Users,
  Radio,
  ChevronLeft,
  ChevronRight,
  FileText,
  BarChart3
} from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  description?: string
  badge?: string | number
}

export default function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/admin/dashboard',
      description: 'Overview & stats'
    },
    {
      id: 'employers',
      label: 'Employers',
      icon: <Building2 className="h-5 w-5" />,
      path: '/admin/employers',
      description: 'Manage businesses'
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/admin/billing',
      description: 'Invoices & payments',
      badge: 3
    },
    {
      id: 'users',
      label: 'Users',
      icon: <Users className="h-5 w-5" />,
      path: '/admin/users',
      description: 'Providers & patients'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/admin/analytics',
      description: 'Reports & insights'
    },
    {
      id: 'audit',
      label: 'Audit Log',
      icon: <Shield className="h-5 w-5" />,
      path: '/admin/audit',
      description: 'Security & activity'
    },
    {
      id: 'broadcast',
      label: 'Broadcast',
      icon: <Radio className="h-5 w-5" />,
      path: '/admin/broadcast',
      description: 'Mass messaging'
    },
    {
      id: 'backup',
      label: 'Backup',
      icon: <Database className="h-5 w-5" />,
      path: '/admin/backup',
      description: 'System backups'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/admin/settings',
      description: 'System config'
    }
  ]


  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <FileText className="h-6 w-6 text-blue-400" />
            {!isCollapsed && (
              <span className="text-lg font-semibold">Admin Panel</span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1.5 hover:bg-gray-800 rounded-md transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium flex items-center gap-2">
                    {item.label}
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {item.description}
                    </div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}