import { SecureLayout } from '@/components/layout/SecureLayout'
import { Card } from '@/components/ui/card'
import { Users, Shield, Activity, Database } from 'lucide-react'

export default function SecureAdminDashboard() {
  return (
    <SecureLayout allowedRoles={['admin', 'owner']}>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 text-white">
            <div className="p-6">
              <Users className="w-8 h-8 mb-2 text-blue-400" />
              <h3 className="text-lg font-semibold">Total Users</h3>
              <p className="text-2xl font-bold">2,847</p>
            </div>
          </Card>
          
          <Card className="bg-white/10 border-white/20 text-white">
            <div className="p-6">
              <Shield className="w-8 h-8 mb-2 text-green-400" />
              <h3 className="text-lg font-semibold">Active Sessions</h3>
              <p className="text-2xl font-bold">342</p>
            </div>
          </Card>
          
          <Card className="bg-white/10 border-white/20 text-white">
            <div className="p-6">
              <Activity className="w-8 h-8 mb-2 text-yellow-400" />
              <h3 className="text-lg font-semibold">API Calls</h3>
              <p className="text-2xl font-bold">18.5k</p>
            </div>
          </Card>
          
          <Card className="bg-white/10 border-white/20 text-white">
            <div className="p-6">
              <Database className="w-8 h-8 mb-2 text-purple-400" />
              <h3 className="text-lg font-semibold">Storage Used</h3>
              <p className="text-2xl font-bold">2.3 TB</p>
            </div>
          </Card>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-white/80">
              <span>New user registered: john.doe@example.com</span>
              <span className="text-sm">2 minutes ago</span>
            </div>
            <div className="flex items-center justify-between text-white/80">
              <span>API rate limit exceeded for employer_id: 234</span>
              <span className="text-sm">15 minutes ago</span>
            </div>
            <div className="flex items-center justify-between text-white/80">
              <span>Database backup completed successfully</span>
              <span className="text-sm">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </SecureLayout>
  )
}