import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 bg-gradient-to-br from-white via-sky-50 to-slate-100 min-h-screen relative">
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
          {children}
        </div>
      </div>
    </div>
  )
}