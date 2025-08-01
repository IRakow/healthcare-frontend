import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Users, DollarSign, LogOut, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className={`bg-gray-900 text-white min-h-screen p-4 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-xl font-bold ${collapsed ? 'hidden' : 'block'}`}>Admin</h1>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav>
        <ul className="space-y-2 text-sm">
          <li onClick={() => navigate('/admin')} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition">
            <Home size={18} />
            {!collapsed && 'Dashboard'}
          </li>
          <li onClick={() => navigate('/admin/employers')} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition">
            <Users size={18} />
            {!collapsed && 'Employers'}
          </li>
          <li onClick={() => navigate('/admin/invoices')} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition">
            <DollarSign size={18} />
            {!collapsed && 'Invoices'}
          </li>
          <li onClick={() => navigate('/admin/settings')} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition">
            <Settings size={18} />
            {!collapsed && 'Settings'}
          </li>
        </ul>
      </nav>

      <div className="mt-10 border-t border-gray-700 pt-4">
        <div onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-600 cursor-pointer transition text-red-400 hover:text-white">
          <LogOut size={18} />
          {!collapsed && 'Logout'}
        </div>
      </div>
    </aside>
  )
}