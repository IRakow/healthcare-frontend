// src/components/layout/PatientLayout.tsx

import { ReactNode, useState } from 'react'
import { NavLink } from 'react-router-dom'
import AssistantBar from '@/components/assistant/AssistantBar'
import { patientSidebarLinks } from '@/config/patientSidebar'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PatientLayoutProps {
  children: ReactNode
  title?: string
}

export default function PatientLayout({ children, title }: PatientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        fixed md:sticky md:top-0 inset-y-0 left-0 z-40 w-64 h-screen transform transition-transform duration-300 ease-in-out
        bg-white/80 backdrop-blur p-6 border-r shadow-xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-sky-800 mb-1">Patient Portal</h2>
          <p className="text-sm text-gray-500">Navigation</p>
        </div>
        <nav className="space-y-1">
          {patientSidebarLinks.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm',
                  isActive ? 'bg-sky-100 text-sky-800' : 'text-gray-700 hover:bg-sky-50'
                )
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
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
      <main className="flex-1 p-4 md:p-8 md:ml-0 bg-white/60 backdrop-blur rounded-3xl shadow-inner">
        {children}
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <AssistantBar />
      </div>
    </div>
  )
}
