import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Lottie from 'lottie-react'
import pulseLogo from '/lottie/HeartCubePulseFinal.json'
import {
  Home,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  ChevronLeft
} from 'lucide-react'

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navItem = (label: string, path: string, icon: JSX.Element) => (
    <li
      onClick={() => navigate(path)}
      className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition cursor-pointer"
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </li>
  )

  return (
    <aside
      className={`bg-gray-900 text-white min-h-screen flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col items-center px-4 py-4 border-b border-gray-800">
        <div className="flex justify-center items-center mb-6">
          {!collapsed ? (
            <Lottie
              animationData={pulseLogo}
              loop
              autoplay
              className="w-36 h-36"
              style={{ marginTop: '-12px' }}
            />
          ) : (
            <div className="w-6 h-6 bg-cyan-400 rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex items-center justify-between w-full">
          {!collapsed && <span className="text-lg font-semibold">Admin</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white transition ml-auto"
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      <nav className="flex-1 px-2 pt-6">
        <ul className="space-y-2">
          {navItem('Dashboard', '/admin', <Home size={18} />)}
          {navItem('Employers', '/admin/employers', <Users size={18} />)}
          {navItem('Invoices', '/admin/invoices', <DollarSign size={18} />)}
          {navItem('Settings', '/admin/settings', <Settings size={18} />)}
        </ul>
      </nav>

      <div className="mt-auto px-2 pb-6 border-t border-gray-800 pt-4">
        <li
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-red-600 hover:text-white text-red-400 cursor-pointer transition"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </li>
      </div>
    </aside>
  )
}