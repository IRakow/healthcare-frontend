import { useEffect, useState } from 'react'
import AdminLayout from '@/layouts/AdminLayout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  RefreshCw,
  ShieldCheck,
  Clock,
  FileText,
  AlertTriangle,
  Search,
  XCircle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AuditLog {
  id: string
  action: string
  user: string
  ip: string
  timestamp: string
  category: 'auth' | 'system' | 'data' | 'security'
  status: 'success' | 'warning' | 'error'
  context?: string
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoading(true)
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        action: 'Login Attempt',
        user: 'ian@admin.com',
        ip: '192.168.1.10',
        timestamp: new Date().toISOString(),
        category: 'auth',
        status: 'success',
        context: 'Logged in via web portal',
      },
      {
        id: '2',
        action: 'Deleted Patient Record',
        user: 'admin@insperity.com',
        ip: '172.16.0.3',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        category: 'data',
        status: 'warning',
        context: 'Patient ID: 14392, manual override'
      },
      {
        id: '3',
        action: 'Permission Escalation Denied',
        user: 'john@staff.com',
        ip: '10.0.0.42',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        category: 'security',
        status: 'error',
        context: 'Tried to access billing admin panel'
      }
    ]
    setTimeout(() => {
      setLogs(mockLogs)
      setLoading(false)
    }, 500)
  }

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.context?.toLowerCase().includes(search.toLowerCase())
  )

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <AdminLayout>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-800 flex items-center gap-3">
                <FileText className="w-7 h-7 text-primary" /> Audit Logs
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Monitor sensitive actions across the platform in real time.</p>
            </div>
            <Button onClick={loadLogs} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" /> Reload
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search actions, users, or context..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl max-w-xl"
            />
          </div>

          <div className="space-y-4">
            {filtered.map(log => (
              <Card key={log.id} className="p-4 border border-gray-200 bg-white/80 backdrop-blur-md rounded-xl shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      {getIcon(log.status)} {log.action}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      User: <span className="text-blue-600 font-medium">{log.user}</span> • IP: {log.ip} • {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </div>
                    {log.context && (
                      <div className="text-xs text-gray-500 italic">{log.context}</div>
                    )}
                  </div>
                  <Badge variant={
                    log.category === 'auth' ? 'default' :
                    log.category === 'data' ? 'secondary' :
                    log.category === 'system' ? 'outline' : 'destructive'
                  }>
                    {log.category.toUpperCase()}
                  </Badge>
                </div>
              </Card>
            ))}

            {filtered.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                <AlertCircle className="h-4 w-4 text-gray-500" /> No log entries match your query.
              </div>
            )}
          </div>
    </AdminLayout>
  )
}