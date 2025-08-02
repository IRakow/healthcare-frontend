import AdminLayout from '@/components/layout/AdminLayout'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Download, Banknote, TrendingDown, CalendarClock } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Invoice {
  id: string
  company: string
  amount: number
  due: string
  status: 'paid' | 'overdue' | 'pending'
  last_reminder?: string
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const today = new Date()
    setInvoices([
      { id: 'inv001', company: 'Brightwell Solutions', amount: 1242, due: format(today, 'yyyy-MM-dd'), status: 'pending', last_reminder: formatDistanceToNow(today) },
      { id: 'inv002', company: 'NovaHealth', amount: 3321, due: format(today, 'yyyy-MM-dd'), status: 'overdue', last_reminder: '2 days ago' },
      { id: 'inv003', company: 'SkyWellness', amount: 4100, due: format(today, 'yyyy-MM-dd'), status: 'paid' }
    ])
  }, [])

  const filtered = invoices.filter(inv => inv.company.toLowerCase().includes(search.toLowerCase()))

  const exportCsv = () => {
    const csv = [
      ['ID', 'Company', 'Amount', 'Due', 'Status', 'Last Reminder'].join(','),
      ...filtered.map(i => [i.id, i.company, i.amount, i.due, i.status, i.last_reminder || '—'].join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'invoices.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Banknote className="w-6 h-6 text-green-600" /> Invoices & Payments
        </h1>
        <Button onClick={exportCsv} size="sm">
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      <Input
        className="mt-6 max-w-md"
        placeholder="Search invoices by company..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filtered.map(inv => (
          <Card key={inv.id} className="p-4 bg-white/90 rounded-xl border space-y-2">
            <h2 className="text-lg font-semibold text-slate-800">{inv.company}</h2>
            <p className="text-sm text-muted-foreground">Invoice #{inv.id}</p>
            <p className="text-sm text-slate-600">Amount: ${inv.amount.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Due: {format(new Date(inv.due), 'PPP')}</p>
            {inv.last_reminder && (
              <p className="text-xs flex items-center gap-1 text-blue-600">
                <CalendarClock className="w-3 h-3" /> Reminder: {inv.last_reminder}
              </p>
            )}
            <Badge variant={inv.status === 'paid' ? 'default' : inv.status === 'overdue' ? 'destructive' : 'secondary'} className="capitalize">
              {inv.status}
            </Badge>
            {inv.status === 'overdue' && (
              <p className="text-xs text-yellow-700 italic flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> At-risk of payment failure
              </p>
            )}
          </Card>
        ))}
      </div>
    </AdminLayout>
  )
}