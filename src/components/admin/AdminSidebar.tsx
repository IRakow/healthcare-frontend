import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Lottie from 'lottie-react'
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
  const [animationData, setAnimationData] = useState<Record<string, any> | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/lottie/HeartCubePulseFinal.json')
      .then(res => res.json())
      .then(setAnimationData)
      .catch(err => console.error('Lottie load error:', err))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navItem = (label: string, path: string, icon: JSX.Element) => (
    <li
      onClick={() => navigate(path)}
      className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-sky-50 transition cursor-pointer font-medium"
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </li>
  )

  return (
    <aside
      className={`bg-white/80 backdrop-blur-lg min-h-screen flex flex-col transition-all duration-300 border-r shadow-xl ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top animated logo */}
      <div className="flex justify-center items-center px-2 py-6 border-b border-gray-200">
        {!collapsed ? (
          animationData ? (
            <Lottie
              animationData={animationData}
              loop
              autoplay
              className="w-36 h-36"
              style={{ marginTop: '-12px' }}
            />
          ) : (
            <div className="w-36 h-36 flex items-center justify-center">
              <div className="w-8 h-8 bg-cyan-400 rounded-full animate-pulse" />
            </div>
          )
        ) : (
          <div className="w-6 h-6 bg-cyan-400 rounded-full animate-pulse" />
        )}
      </div>

      {/* Collapse toggle */}
      <div className="flex justify-end px-4 py-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2">
        <ul className="space-y-2">
          {navItem('Dashboard', '/admin', <Home size={18} />)}
          {navItem('Employers', '/admin/employers', <Users size={18} />)}
          {navItem('Invoices', '/admin/invoices', <DollarSign size={18} />)}
          {navItem('Settings', '/admin/settings', <Settings size={18} />)}
        </ul>
      </nav>

      {/* Logout */}
      <ul className="px-2 pb-6 pt-4 border-t border-gray-200">
        <li
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 cursor-pointer transition font-medium"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </li>
      </ul>
    </aside>
  )
}