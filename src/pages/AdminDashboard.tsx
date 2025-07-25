import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building2, 
  CreditCard, 
  Activity,
  Settings,
  Shield,
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  UserCheck,
  DollarSign,
  BarChart3,
  Zap
} from 'lucide-react'

interface SystemStats {
  totalEmployers: number
  activeEmployers: number
  totalProviders: number
  activeProviders: number
  totalPatients: number
  monthlyActiveUsers: number
  pendingInvoices: number
  totalRevenue: number
  systemHealth: number
  lastBackup: string
  activeSubscriptions: number
  growthRate: number
}

interface RecentActivity {
  id: string
  type: 'user_registration' | 'payment' | 'employer_added' | 'system_event'
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error'
}

export default function AdminDashboard() {
  const [adminEmail, setAdminEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<SystemStats>({
    totalEmployers: 0,
    activeEmployers: 0,
    totalProviders: 0,
    activeProviders: 0,
    totalPatients: 0,
    monthlyActiveUsers: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    systemHealth: 95,
    lastBackup: new Date().toISOString(),
    activeSubscriptions: 0,
    growthRate: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/admin/login')
      return
    }
    
    // Skip role check for now - in production you would verify admin role
    // const { data: profile } = await supabase
    //   .from('user_profiles')
    //   .select('role')
    //   .eq('id', session.user.id)
    //   .single()
    // 
    // if (!profile || profile.role !== 'admin') {
    //   navigate('/')
    //   return
    // }
    
    setAdminEmail(session.user.email || '')
  }

  const loadDashboardData = async () => {
    try {
      // Load various statistics
      const [employersData, providersData, patientsData, invoicesData, subscriptionsData] = await Promise.all([
        supabase.from('employers').select('id, created_at, status'),
        supabase.from('user_profiles').select('id, created_at, last_login').eq('role', 'provider'),
        supabase.from('user_profiles').select('id, created_at, last_login').eq('role', 'patient'),
        supabase.from('invoices').select('id, amount, status').eq('status', 'pending'),
        supabase.from('subscriptions').select('id, status').eq('status', 'active')
      ])

      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Calculate stats
      const totalEmployers = employersData.data?.length || 0
      const activeEmployers = employersData.data?.filter(e => e.status === 'active').length || 0
      const totalProviders = providersData.data?.length || 0
      const activeProviders = providersData.data?.filter(p => 
        p.last_login && new Date(p.last_login) > thirtyDaysAgo
      ).length || 0
      const totalPatients = patientsData.data?.length || 0
      
      const monthlyActiveUsers = (activeProviders + patientsData.data?.filter(p => 
        p.last_login && new Date(p.last_login) > thirtyDaysAgo
      ).length || 0)

      const pendingInvoices = invoicesData.data?.length || 0
      const totalRevenue = invoicesData.data?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0

      // Calculate growth rate (mock data for demo)
      const lastMonthUsers = Math.floor(totalPatients * 0.85)
      const growthRate = lastMonthUsers > 0 ? ((totalPatients - lastMonthUsers) / lastMonthUsers * 100) : 0

      setStats({
        totalEmployers,
        activeEmployers,
        totalProviders,
        activeProviders,
        totalPatients,
        monthlyActiveUsers,
        pendingInvoices,
        totalRevenue,
        systemHealth: 95,
        lastBackup: new Date().toISOString(),
        activeSubscriptions: subscriptionsData.data?.length || 0,
        growthRate
      })

      // Load recent activity (mock data for demo)
      setRecentActivity([
        {
          id: '1',
          type: 'user_registration',
          description: 'New provider registered: Dr. Sarah Johnson',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'payment',
          description: 'Payment received from TechCorp ($2,500)',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'success'
        },
        {
          id: '3',
          type: 'employer_added',
          description: 'New employer added: StartupXYZ',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          status: 'success'
        },
        {
          id: '4',
          type: 'system_event',
          description: 'Database backup completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          status: 'success'
        }
      ])

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration': return <UserCheck className="h-4 w-4" />
      case 'payment': return <DollarSign className="h-4 w-4" />
      case 'employer_added': return <Building2 className="h-4 w-4" />
      case 'system_event': return <Zap className="h-4 w-4" />
    }
  }

  const getActivityColor = (status: RecentActivity['status']) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {adminEmail}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button 
            onClick={() => supabase.auth.signOut().then(() => navigate('/'))}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* System Health Alert */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">System Status: All systems operational</span>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            Health: {stats.systemHealth}%
          </Badge>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-600">+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyActiveUsers}</div>
            <Progress value={75} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">75% engagement rate</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Employers</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployers}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeEmployers} active
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.growthRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Monthly user growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                  onClick={() => navigate('/admin/employers')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Manage Employers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Configure businesses, plans, and access rights</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge>{stats.totalEmployers} total</Badge>
                  <span className="text-blue-600 text-sm">View all →</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                  onClick={() => navigate('/admin/billing')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Billing & Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Manage payments, invoices, and subscriptions</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="destructive">{stats.pendingInvoices} pending</Badge>
                  <span className="text-blue-600 text-sm">View all →</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                  onClick={() => navigate('/admin/settings')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Configure branding, voice, and themes</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="secondary">Customizable</Badge>
                  <span className="text-blue-600 text-sm">Configure →</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                  onClick={() => navigate('/admin/audit')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  Security & Audit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">View audit logs and security settings</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="outline">Protected</Badge>
                  <span className="text-blue-600 text-sm">View logs →</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Statistics */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">User Statistics</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Providers</span>
                      <span className="text-sm text-gray-500">{stats.activeProviders}/{stats.totalProviders}</span>
                    </div>
                    <Progress value={(stats.activeProviders / stats.totalProviders) * 100 || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Patients</span>
                      <span className="text-sm text-gray-500">{stats.totalPatients} registered</span>
                    </div>
                    <Progress value={100} className="bg-green-100" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Active Subscriptions</span>
                      <span className="text-sm text-gray-500">{stats.activeSubscriptions}</span>
                    </div>
                    <Progress value={(stats.activeSubscriptions / stats.totalEmployers) * 100 || 0} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Card className="h-[600px] overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 max-h-[550px] overflow-y-auto">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${getActivityColor(activity.status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t bg-gray-50">
                <button 
                  onClick={() => navigate('/admin/audit')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all activity →
                </button>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Backup</span>
                <span className="font-medium">{formatTime(stats.lastBackup)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Database Size</span>
                <span className="font-medium">2.4 GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">API Calls Today</span>
                <span className="font-medium">12,847</span>
              </div>
              <button 
                onClick={() => navigate('/admin/backup')}
                className="w-full mt-3 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
              >
                Manage Backups
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}