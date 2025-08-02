import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, RefreshCw, Download, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Employer {
  id: string
  name: string
  email: string
  industry: string
  created_at: string
  employee_count: number
  health_score: number // AI-derived engagement/activation proxy
}

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const data: Employer[] = [
      {
        id: '1',
        name: 'Brightwell Solutions',
        email: 'contact@brightwell.com',
        industry: 'Healthcare',
        created_at: new Date().toISOString(),
        employee_count: 80,
        health_score: 91
      },
      {
        id: '2',
        name: 'Northbeam LLC',
        email: 'admin@northbeam.io',
        industry: 'Tech',
        created_at: new Date().toISOString(),
        employee_count: 120,
        health_score: 78
      }
    ]
    setEmployers(data)
  }, [])

  const filtered = employers.filter(emp => emp.name.toLowerCase().includes(search.toLowerCase()) || emp.email.toLowerCase().includes(search.toLowerCase()))

  const exportCSV = () => {
    const csv = [
      ['ID', 'Name', 'Email', 'Industry', 'Employees', 'Health Score', 'Created At'].join(','),
      ...filtered.map(emp => [emp.id, emp.name, emp.email, emp.industry, emp.employee_count, emp.health_score, emp.created_at].join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employers.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
            <Building2 className="w-6 h-6 text-primary" /> Employers
          </h1>
          <p className="text-sm text-muted-foreground">Monitor health scores, activity levels, and take action fast.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast('Refreshed')}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
          <Button onClick={exportCSV} size="sm"><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
        </div>
      </div>

      <Input className="mt-6 max-w-md" placeholder="Search employers by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filtered.map(emp => (
          <Card key={emp.id} className="bg-white/90 border p-4 rounded-xl space-y-2">
            <h2 className="text-lg font-semibold text-slate-800">{emp.name}</h2>
            <p className="text-sm text-muted-foreground">{emp.email}</p>
            <p className="text-xs text-gray-400">{emp.industry} • {emp.employee_count} employees</p>
            <Badge className="text-xs bg-sky-100 text-sky-700">Health Score: {emp.health_score}</Badge>
            {emp.health_score < 80 && <p className="text-xs text-yellow-600 italic flex items-center gap-1"><TrendingUp className="w-3 h-3" /> At-risk account</p>}
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground italic">No employers found</p>}
      </div>
    </AdminLayout>
  )
}