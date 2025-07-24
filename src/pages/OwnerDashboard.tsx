import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Shield,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Settings,
  FileText,
  Download,
  Plus,
  Palette,
  Brain,
  UserPlus,
  CreditCard,
  Bell
} from 'lucide-react'

interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  pendingOnboarding: number
  appointmentsThisMonth: number
  platformUsage: number
  costSavings: number
  satisfactionScore: number
  newEmployeesThisMonth: number
}

interface Employee {
  id: string
  name: string
  email: string
  status: 'active' | 'pending' | 'inactive'
  department: string
  enrollmentDate: string
  lastActive: string
  healthScore: number
}

interface UsageData {
  month: string
  appointments: number
  activeUsers: number
  engagementRate: number
}

export default function OwnerDashboard() {
  const [ownerEmail, setOwnerEmail] = useState('')
  const [companyName, setCompanyName] = useState('Your Company')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingOnboarding: 0,
    appointmentsThisMonth: 0,
    platformUsage: 0,
    costSavings: 0,
    satisfactionScore: 0,
    newEmployeesThisMonth: 0
  })
  const [employees, setEmployees] = useState<Employee[]>([])
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/owner/login')
      return
    }
    
    setOwnerEmail(session.user.email || '')
    
    // Skip role check for now - in production you would verify owner role
    // const { data: profile } = await supabase
    //   .from('user_profiles')
    //   .select('role, company_name')
    //   .eq('id', session.user.id)
    //   .single()
    // 
    // if (!profile || profile.role !== 'owner') {
    //   navigate('/')
    //   return
    // }
    
    setCompanyName('Your Company') // profile.company_name || 'Your Company'
  }

  const loadDashboardData = async () => {
    try {
      // Mock data for demonstration
      const mockEmployees: Employee[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.j@company.com',
          status: 'active',
          department: 'Engineering',
          enrollmentDate: '2024-01-15',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          healthScore: 92
        },
        {
          id: '2',
          name: 'Mike Chen',
          email: 'mike.c@company.com',
          status: 'active',
          department: 'Sales',
          enrollmentDate: '2024-02-01',
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          healthScore: 87
        },
        {
          id: '3',
          name: 'Emily Davis',
          email: 'emily.d@company.com',
          status: 'pending',
          department: 'Marketing',
          enrollmentDate: '2024-03-10',
          lastActive: '',
          healthScore: 0
        }
      ]

      setEmployees(mockEmployees)

      // Calculate stats
      const totalEmployees = mockEmployees.length
      const activeEmployees = mockEmployees.filter(e => e.status === 'active').length
      const pendingOnboarding = mockEmployees.filter(e => e.status === 'pending').length
      const appointmentsThisMonth = Math.floor(Math.random() * 50) + 20
      const platformUsage = Math.floor((activeEmployees / totalEmployees) * 100)
      const costSavings = Math.floor(Math.random() * 10000) + 5000
      const satisfactionScore = Math.floor(Math.random() * 20) + 80
      const newEmployeesThisMonth = Math.floor(Math.random() * 5) + 1

      setStats({
        totalEmployees,
        activeEmployees,
        pendingOnboarding,
        appointmentsThisMonth,
        platformUsage,
        costSavings,
        satisfactionScore,
        newEmployeesThisMonth
      })

      // Generate usage trend data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      const usage = months.map((month, idx) => ({
        month,
        appointments: Math.floor(Math.random() * 30) + 10,
        activeUsers: Math.floor(activeEmployees * (0.6 + idx * 0.06)),
        engagementRate: Math.floor(Math.random() * 30) + 60
      }))
      setUsageData(usage)

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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'inactive': return 'bg-gray-100 text-gray-700'
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{companyName} Health Portal</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, {ownerEmail}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/owner/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => navigate('/owner/notifications')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Platform Usage</CardTitle>
              <Activity className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.platformUsage}%</div>
              <Progress value={stats.platformUsage} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">{stats.activeEmployees} of {stats.totalEmployees} active</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.costSavings)}</div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-600">+23% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.appointmentsThisMonth}</div>
              <p className="text-xs text-gray-500 mt-1">This month</p>
              <Badge variant="secondary" className="mt-2 text-xs">
                Avg 2.5 per employee
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.satisfactionScore}%</div>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.floor(stats.satisfactionScore / 20)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate('/owner/employees')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-blue-600" />
                Employee Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Manage enrolled employees and onboarding</p>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="outline">{stats.pendingOnboarding} pending</Badge>
                <span className="text-blue-600 text-sm">Manage →</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate('/owner/branding')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-5 w-5 text-purple-600" />
                AI & Branding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Customize voice, colors, and messaging</p>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="secondary">Customizable</Badge>
                <span className="text-blue-600 text-sm">Configure →</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate('/owner/analytics')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Track usage, appointments, and trends</p>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="outline">Real-time</Badge>
                <span className="text-blue-600 text-sm">View →</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate('/owner/invoices')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-5 w-5 text-orange-600" />
                Billing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">View invoices and payment history</p>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="outline">Up to date</Badge>
                <span className="text-blue-600 text-sm">View →</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="usage">Usage Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Employee Overview</h2>
              <button
                onClick={() => navigate('/owner/employees/add')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Add Employee
              </button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrolled
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Health Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                              <div className="text-sm text-gray-500">{employee.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {employee.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(employee.status)}>
                              {employee.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(employee.enrollmentDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(employee.lastActive)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {employee.healthScore > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${employee.healthScore}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{employee.healthScore}%</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => navigate(`/owner/employee/${employee.id}`)}
                              className="text-green-600 hover:text-green-900"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Trends Tab */}
          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageData.map((data, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{data.month}</span>
                        <span className="text-sm text-gray-500">
                          {data.activeUsers} active users • {data.appointments} appointments
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${data.engagementRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Most Active Departments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Engineering</span>
                      <Badge>85% active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sales</span>
                      <Badge>78% active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Marketing</span>
                      <Badge>72% active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Popular Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Virtual Consultations</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mental Health Support</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Preventive Care</span>
                      <span className="text-sm font-medium">27%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Key Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span className="text-sm">23% increase in employee engagement this month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span className="text-sm">Average response time under 5 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span className="text-sm">92% employee satisfaction rating</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-sm">Peak usage hours: 10 AM - 12 PM</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-sm">Most common queries: Mental health, preventive care</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-sm">Recommended: Wellness workshop for Sales team</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <span className="text-sm">Monthly Report</span>
                  </button>
                  <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <ChartBar className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <span className="text-sm">Usage Analytics</span>
                  </button>
                  <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Shield className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <span className="text-sm">Compliance</span>
                  </button>
                  <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <span className="text-sm">Export All</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}