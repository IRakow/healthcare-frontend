import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Download, RefreshCw, Users } from 'lucide-react'
import { format } from 'date-fns'
import AdminLayout from '@/layouts/AdminLayout'

interface Employer {
  id: string
  name: string
  email: string
  employee_count: number
  industry?: string
  created_at: string
  subscription_tier?: string
  is_active?: boolean
}

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEmployers()
  }, [])

  const loadEmployers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('employers').select('*').order('created_at', { ascending: false })
    if (!error && data) {
      setEmployers(data)
    }
    setLoading(false)
  }

  const exportEmployers = () => {
    const csv = [
      ['ID', 'Name', 'Email', 'Employees', 'Industry', 'Tier', 'Created At'].join(','),
      ...employers.map(emp => [
        emp.id,
        emp.name,
        emp.email,
        emp.employee_count,
        emp.industry || '',
        emp.subscription_tier || '',
        format(new Date(emp.created_at), 'yyyy-MM-dd')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employers.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = employers.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-800 flex items-center gap-3">
                <Users className="w-7 h-7 text-primary" /> Employers
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Monitor, manage, and engage with every company on the platform.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={loadEmployers} variant="outline" size="sm" className="shadow-sm">
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
              <Button onClick={exportEmployers} size="sm" className="shadow-sm">
                <Download className="w-4 h-4 mr-1" /> Export CSV
              </Button>
            </div>
          </div>

          <div>
            <Input
              placeholder="🔍 Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md rounded-xl shadow-inner border border-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(emp => (
              <Card key={emp.id} className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-md hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-blue-900">
                    {emp.name}
                  </CardTitle>
                  <p className="text-xs text-gray-400">Joined {format(new Date(emp.created_at), 'MMM d, yyyy')}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-700">{emp.email}</div>
                  <div className="text-xs text-gray-500">Employees: {emp.employee_count}</div>
                  {emp.subscription_tier && (
                    <Badge className="capitalize bg-blue-100 text-blue-700 border border-blue-200">
                      {emp.subscription_tier}
                    </Badge>
                  )}
                  <div className="pt-3 flex gap-2">
                    <Button variant="secondary" size="sm" className="rounded-xl px-3">View</Button>
                    <Button variant="ghost" size="sm" className="rounded-xl text-red-500 hover:bg-red-50">Suspend</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No employers match your search criteria.</div>
          )}
    </AdminLayout>
  )
}