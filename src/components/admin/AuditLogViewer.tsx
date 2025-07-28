import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Search, Download, Filter, AlertCircle, User, FileText, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface AuditLog {
  id: string
  action: string
  entity_type: string
  entity_id: string
  user_id: string
  metadata: any
  ip_address: string
  user_agent: string
  created_at: string
  user?: {
    full_name: string
    email: string
    role: string
  }
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    entityType: '',
    userId: '',
    startDate: '',
    endDate: ''
  })
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 50

  useEffect(() => {
    fetchLogs()
  }, [page])

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles!audit_logs_user_id_fkey(
            full_name,
            email,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      // Apply filters
      if (filters.search) {
        query = query.or(`action.ilike.%${filters.search}%,metadata.ilike.%${filters.search}%`)
      }
      if (filters.action) {
        query = query.eq('action', filters.action)
      }
      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType)
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate)
      }

      const { data, error, count } = await query

      if (error) throw error

      if (page === 0) {
        setLogs(data || [])
      } else {
        setLogs(prev => [...prev, ...(data || [])])
      }

      setHasMore((data?.length || 0) === pageSize)
    } catch (err) {
      toast.error('Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(0)
    setLogs([])
    fetchLogs()
  }

  const exportLogs = async () => {
    try {
      const allLogs = [...logs]
      const csv = [
        ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Details'],
        ...allLogs.map(log => [
          format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
          log.user?.email || 'System',
          log.action,
          log.entity_type,
          log.entity_id || 'N/A',
          log.ip_address || 'N/A',
          JSON.stringify(log.metadata || {})
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Audit logs exported')
    } catch (err) {
      toast.error('Failed to export logs')
    }
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('delete') || action.includes('remove')) return 'destructive'
    if (action.includes('create') || action.includes('add')) return 'success'
    if (action.includes('update') || action.includes('modify')) return 'warning'
    if (action.includes('access') || action.includes('view')) return 'secondary'
    return 'default'
  }

  const getActionIcon = (action: string) => {
    if (action.includes('auth')) return '🔐'
    if (action.includes('patient')) return '🏥'
    if (action.includes('file')) return '📄'
    if (action.includes('appointment')) return '📅'
    if (action.includes('admin')) return '⚙️'
    if (action.includes('consent')) return '✅'
    if (action.includes('emergency')) return '🚨'
    return '📝'
  }

  return (
    <div className="space-y-6">
      <Section title="Audit Logs" icon={Shield} description="HIPAA-compliant activity tracking">
        <GlassCard className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search actions or metadata..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="bg-glass"
            />
            <Input
              type="date"
              placeholder="Start date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="bg-glass"
            />
            <Input
              type="date"
              placeholder="End date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="bg-glass"
            />
          </div>

          <div className="flex justify-between">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button onClick={exportLogs} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </GlassCard>
      </Section>

      {/* Logs List */}
      <GlassCard>
        <div className="space-y-2">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading audit logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No audit logs found</p>
          ) : (
            <>
              {logs.map((log) => (
                <div key={log.id} className="p-4 border border-white/10 rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getActionIcon(log.action)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getActionBadgeColor(log.action) as any}>
                            {log.action}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {log.entity_type}
                            {log.entity_id && ` #${log.entity_id.slice(0, 8)}...`}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.user?.full_name || log.user?.email || 'System'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                          </span>
                          {log.ip_address && (
                            <span className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {log.ip_address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2 p-2 bg-black/20 rounded text-sm">
                      <details className="cursor-pointer">
                        <summary className="text-muted-foreground">View Details</summary>
                        <pre className="mt-2 text-xs overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}

              {hasMore && (
                <Button
                  onClick={() => setPage(page + 1)}
                  variant="outline"
                  className="w-full"
                >
                  Load More
                </Button>
              )}
            </>
          )}
        </div>
      </GlassCard>
    </div>
  )
}