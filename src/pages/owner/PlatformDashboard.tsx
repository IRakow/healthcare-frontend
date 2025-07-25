import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Server,
  Shield,
  AlertCircle,
  CheckCircle,
  Bot,
  BarChart3,
  Clock,
  Zap,
  Building2,
  Mail,
  Phone,
  CreditCard,
  Globe,
  Database,
  Cpu,
  HardDrive,
  Gauge,
  UserPlus,
  Settings,
  FileText,
  Download,
  Brain,
  Sparkles
} from 'lucide-react'

export default function PlatformDashboard() {
  const navigate = useNavigate()
  const [aiPrompt, setAiPrompt] = useState('')

  const systemMetrics = {
    uptime: '99.9%',
    responseTime: '145ms',
    activeUsers: 3420,
    apiCalls: '2.3M',
    storage: { used: 2.4, total: 5, unit: 'TB' },
    cpu: 42,
    memory: 68
  }

  const aiInsights = [
    {
      type: 'revenue',
      title: 'Revenue Opportunity',
      description: '5 trial companies show high engagement. Consider reaching out for conversion.',
      action: 'View Companies',
      priority: 'high'
    },
    {
      type: 'risk',
      title: 'Churn Risk Alert',
      description: '2 companies showing decreased usage patterns in the last 30 days.',
      action: 'Investigate',
      priority: 'medium'
    },
    {
      type: 'growth',
      title: 'Growth Suggestion',
      description: 'Healthcare sector showing 40% higher conversion. Focus marketing efforts.',
      action: 'View Analysis',
      priority: 'low'
    }
  ]

  const quickActions = [
    { icon: UserPlus, label: 'Invite Users', path: '/owner/user-invitations', color: 'bg-blue-500' },
    { icon: Building2, label: 'Manage Companies', path: '/owner/company-management', color: 'bg-green-500' },
    { icon: CreditCard, label: 'Billing', path: '/owner/billing-statement', color: 'bg-purple-500' },
    { icon: Shield, label: 'Security', path: '/owner/security', color: 'bg-red-500' },
    { icon: FileText, label: 'Reports', path: '/owner/reports', color: 'bg-yellow-500' },
    { icon: Settings, label: 'Platform Settings', path: '/owner/settings', color: 'bg-gray-500' }
  ]

  const recentActivity = [
    { type: 'user', message: 'John Doe accepted invitation to PMS Corp', time: '5 min ago', icon: UserPlus },
    { type: 'payment', message: 'HealthCo payment of $999 processed', time: '1 hour ago', icon: CreditCard },
    { type: 'company', message: 'MediTech Solutions upgraded to Enterprise', time: '3 hours ago', icon: TrendingUp },
    { type: 'alert', message: 'API rate limit reached for TechHealth', time: '5 hours ago', icon: AlertCircle }
  ]

  const handleAICommand = () => {
    alert(`AI Processing: ${aiPrompt}`)
    setAiPrompt('')
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Platform Command Center</h1>
          <p className="text-gray-600 mt-1">Complete control over your healthcare platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
        </div>
      </div>

      {/* AI Command Bar */}
      <Card className="mb-6 border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Brain className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600" />
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask AI anything: 'Show me companies ready to upgrade' or 'Create report for last month'"
                className="w-full pl-10 pr-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAICommand()}
              />
            </div>
            <Button onClick={handleAICommand} className="bg-purple-600 hover:bg-purple-700">
              <Zap className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Monthly Revenue
              <DollarSign className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$212,540</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Active Companies
              <Building2 className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex gap-1">
                <Badge variant="default" className="text-xs">28 Active</Badge>
                <Badge variant="secondary" className="text-xs">6 Trial</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Total Users
              <Users className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,420</div>
            <div className="text-sm text-gray-500">
              <span className="text-blue-600">+142</span> this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Platform Health
              <Activity className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Excellent</div>
            <div className="text-sm text-gray-500">{systemMetrics.uptime} uptime</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => navigate(action.path)}
            className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-center group"
          >
            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiInsights.map((insight, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={
                          insight.priority === 'high' ? 'destructive' : 
                          insight.priority === 'medium' ? 'secondary' : 'outline'
                        }>
                          {insight.priority}
                        </Badge>
                        <h4 className="font-medium">{insight.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      {insight.action}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU Usage</span>
                <span className="font-medium">{systemMetrics.cpu}%</span>
              </div>
              <Progress value={systemMetrics.cpu} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory</span>
                <span className="font-medium">{systemMetrics.memory}%</span>
              </div>
              <Progress value={systemMetrics.memory} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Storage</span>
                <span className="font-medium">
                  {systemMetrics.storage.used}{systemMetrics.storage.unit} / {systemMetrics.storage.total}{systemMetrics.storage.unit}
                </span>
              </div>
              <Progress value={(systemMetrics.storage.used / systemMetrics.storage.total) * 100} />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="text-center p-2 bg-gray-50 rounded">
                <Gauge className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <p className="text-xs text-gray-600">Response Time</p>
                <p className="text-sm font-medium">{systemMetrics.responseTime}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <Activity className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <p className="text-xs text-gray-600">API Calls</p>
                <p className="text-sm font-medium">{systemMetrics.apiCalls}</p>
              </div>
            </div>

            <Button variant="outline" className="w-full" size="sm">
              View Full Status
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </span>
            <Button variant="outline" size="sm">View All</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 pb-3 border-b last:border-0">
                <div className={`p-2 rounded-full ${
                  activity.type === 'user' ? 'bg-blue-100' :
                  activity.type === 'payment' ? 'bg-green-100' :
                  activity.type === 'company' ? 'bg-purple-100' :
                  'bg-yellow-100'
                }`}>
                  <activity.icon className={`w-4 h-4 ${
                    activity.type === 'user' ? 'text-blue-600' :
                    activity.type === 'payment' ? 'text-green-600' :
                    activity.type === 'company' ? 'text-purple-600' :
                    'text-yellow-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}