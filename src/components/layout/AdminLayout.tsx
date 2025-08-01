import { ReactNode } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { AssistantBar } from '@/components/ai/AssistantBar'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="relative min-h-screen flex bg-gradient-to-br from-white via-sky-50 to-emerald-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
        <div className="rounded-3xl bg-white/60 backdrop-blur shadow-xl p-6 md:p-10">
          {children}
        </div>
      </main>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-4 right-4 z-50">
        <AssistantBar />
      </div>
    </div>
  )
}