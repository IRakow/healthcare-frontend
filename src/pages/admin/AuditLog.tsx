import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AdminSidebar from '@/components/admin/AdminSidebar'
import {
  Shield,
  User,
  Settings,
  Database,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

interface AuditLogEntry {
  id: string
  action: string
  category: 'auth' | 'user' | 'payment' | 'system' | 'security'
  user_id: string
  user_email: string
  ip_address: string
  details: any
  status: 'success' | 'warning' | 'error'
  timestamp: string
}

export default function AuditLog() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    checkAuth()
    loadAuditLogs()
    const interval = setInterval(loadAuditLogs, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchQuery, categoryFilter, statusFilter])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/admin/login')
      return
    }
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      navigate('/')
    }
  }

  const loadAuditLogs = async () => {
    try {
      // Mock audit log data - in production, this would come from your audit_logs table
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          action: 'User Login',
          category: 'auth',
          user_id: 'user123',
          user_email: 'admin@insperityhealth.com',
          ip_address: '192.168.1.1',
          details: { browser: 'Chrome', os: 'MacOS' },
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        },
        {
          id: '2',
          action: 'Payment Processed',
          category: 'payment',
          user_id: 'user456',
          user_email: 'billing@techcorp.com',
          ip_address: '10.0.0.1',
          details: { amount: 2500, plan: 'enterprise' },
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: '3',
          action: 'Failed Login Attempt',
          category: 'security',
          user_id: 'unknown',
          user_email: 'unknown@example.com',
          ip_address: '203.0.113.0',
          details: { reason: 'Invalid credentials' },
          status: 'error',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
        },
        {
          id: '4',
          action: 'Database Backup Completed',
          category: 'system',
          user_id: 'system',
          user_email: 'system@insperityhealth.com',
          ip_address: 'localhost',
          details: { size: '2.4GB', duration: '5m 23s' },
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
        },
        {
          id: '5',
          action: 'User Role Updated',
          category: 'user',
          user_id: 'admin001',
          user_email: 'superadmin@insperityhealth.com',
          ip_address: '192.168.1.10',
          details: { target_user: 'john.doe@example.com', old_role: 'patient', new_role: 'provider' },
          status: 'warning',
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString()
        }
      ]
      
      setLogs(mockLogs)
      setLoading(false)
    } catch (error) {
      console.error('Error loading audit logs:', error)
      setLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = [...logs]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ip_address.includes(searchQuery) ||
        JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter)
    }

    setFilteredLogs(filtered)
  }

  const getCategoryIcon = (category: AuditLogEntry['category']) => {
    switch (category) {
      case 'auth': return <User className="h-4 w-4" />
      case 'user': return <User className="h-4 w-4" />
      case 'payment': return <CreditCard className="h-4 w-4" />
      case 'system': return <Database className="h-4 w-4" />
      case 'security': return <Shield className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: AuditLogEntry['category']) => {
    switch (category) {
      case 'auth': return 'bg-blue-100 text-blue-700'
      case 'user': return 'bg-purple-100 text-purple-700'
      case 'payment': return 'bg-green-100 text-green-700'
      case 'system': return 'bg-gray-100 text-gray-700'
      case 'security': return 'bg-red-100 text-red-700'
    }
  }

  const getStatusIcon = (status: AuditLogEntry['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Action', 'Category', 'User', 'IP Address', 'Status', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.action,
        log.category,
        log.user_email,
        log.ip_address,
        log.status,
        JSON.stringify(log.details)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor all system activities and security events</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadAuditLogs}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={exportLogs}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="user">User Management</SelectItem>
                    <SelectItem value="payment">Payments</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Table */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span className="text-sm font-medium text-gray-900">{log.action}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${getCategoryColor(log.category)} border-0`}>
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(log.category)}
                              <span className="capitalize">{log.category}</span>
                            </div>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.user_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ip_address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={log.status === 'success' ? 'default' : log.status === 'warning' ? 'secondary' : 'destructive'}
                            className="capitalize"
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <details className="cursor-pointer">
                            <summary>View</summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLogs.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No audit logs found matching your filters.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}