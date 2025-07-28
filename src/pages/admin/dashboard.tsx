// File: src/pages/admin/dashboard.tsx
import { SecureLayout } from '@/components/layout/SecureLayout'

export default function AdminDashboard() {
  return (
    <SecureLayout allowedRoles={['admin', 'owner']}>
      <div className="text-white p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Total Users</h2>
            <p className="text-3xl font-bold">2,847</p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Active Sessions</h2>
            <p className="text-3xl font-bold">342</p>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">System Health</h2>
            <p className="text-3xl font-bold text-green-400">98.5%</p>
          </div>
        </div>
      </div>
    </SecureLayout>
  )
}