import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard,
  Users,
  BarChart3,
  Palette,
  CreditCard,
  Settings,
  FileText,
  UserPlus,
  Brain,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Heart
} from 'lucide-react'
import { useState } from 'react'
import supabase from '@/lib/supabase'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  description?: string
  badge?: string | number
}

export default function OwnerSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/owner/dashboard',
      description: 'Overview & metrics'
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: <Users className="h-5 w-5" />,
      path: '/owner/employees',
      description: 'Manage team members',
      badge: 3
    },
    {
      id: 'onboarding',
      label: 'Onboarding',
      icon: <UserPlus className="h-5 w-5" />,
      path: '/owner/onboarding',
      description: 'New employee setup'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/owner/analytics',
      description: 'Usage & insights'
    },
    {
      id: 'branding',
      label: 'AI & Branding',
      icon: <Palette className="h-5 w-5" />,
      path: '/owner/branding',
      description: 'Customize experience'
    },
    {
      id: 'health',
      label: 'Health Programs',
      icon: <Heart className="h-5 w-5" />,
      path: '/owner/programs',
      description: 'Wellness initiatives'
    },
    {
      id: 'invoices',
      label: 'Billing',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/owner/invoices',
      description: 'Payments & invoices'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="h-5 w-5" />,
      path: '/owner/reports',
      description: 'Generate reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/owner/settings',
      description: 'Account settings'
    }
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <Building2 className="h-6 w-6 text-green-400" />
            {!isCollapsed && (
              <span className="text-lg font-semibold">Owner Portal</span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Company Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium">TechCorp Inc.</div>
              <div className="text-xs text-gray-400">Enterprise Plan</div>
            </div>
          </div>
        </div>
      )}

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
                  ? 'bg-green-600 text-white' 
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

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Active Employees</span>
              <span className="font-medium">247</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Platform Usage</span>
              <span className="font-medium text-green-400">87%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Health Score</span>
              <span className="font-medium">92/100</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-all"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  )
}