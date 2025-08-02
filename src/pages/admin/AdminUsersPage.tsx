import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, RefreshCw, User } from 'lucide-react'
import AdminLayout from '@/layouts/AdminLayout'

interface UserProfile {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'owner' | 'provider' | 'patient'
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false })
    if (!error && data) setUsers(data)
    setLoading(false)
  }

  const exportUsers = () => {
    const csv = [
      ['ID', 'Name', 'Email', 'Role', 'Created At'].join(','),
      ...users.map(u => [u.id, u.full_name, u.email, u.role, u.created_at].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = users.filter(user =>
    user.full_name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-800 flex items-center gap-3">
                <User className="w-7 h-7 text-primary" /> Users
              </h1>
              <p className="text-sm text-muted-foreground mt-1">View and manage all users across the platform.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={loadUsers} variant="outline" size="sm" className="shadow-sm">
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
              <Button onClick={exportUsers} size="sm" className="shadow-sm">
                <Download className="w-4 h-4 mr-1" /> Export CSV
              </Button>
            </div>
          </div>

          <Input
            placeholder="🔍 Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md rounded-xl shadow-inner border border-blue-100"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(user => (
              <Card key={user.id} className="bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-md hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-blue-900">
                    {user.full_name}
                  </CardTitle>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge className={`capitalize border text-xs ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'owner' ? 'bg-blue-100 text-blue-700' :
                    user.role === 'provider' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {user.role}
                  </Badge>
                  <div className="pt-3 flex gap-2">
                    <Button variant="secondary" size="sm" className="rounded-xl px-3">Profile</Button>
                    <Button variant="ghost" size="sm" className="rounded-xl text-red-500 hover:bg-red-50">Deactivate</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No users found matching your search.</div>
          )}
    </AdminLayout>
  )
}