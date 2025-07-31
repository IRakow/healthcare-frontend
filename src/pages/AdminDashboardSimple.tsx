import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  CreditCard, 
  Activity,
  TrendingUp,
  CheckCircle2,
  Clock,
  DollarSign,
  BarChart3
} from 'lucide-react';
import AdminLayoutGlass from '@/components/layout/AdminLayoutGlass';

export default function AdminDashboardSimple() {
  const [stats] = useState({
    totalEmployers: 24,
    activeEmployers: 22,
    totalEmployees: 1847,
    activeEmployees: 1734,
    monthlyRevenue: 125000,
    pendingInvoices: 12,
    systemHealth: 98,
    activeVisits: 7
  });

  return (
    <AdminLayoutGlass>
      <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">System overview and management</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employers</CardTitle>
                <Building2 className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEmployers}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.activeEmployers} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEmployees.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.activeEmployees.toLocaleString()} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(stats.monthlyRevenue / 1000).toFixed(0)}k</div>
                <p className="text-xs text-gray-500 mt-1">
                  <TrendingUp className="h-3 w-3 inline text-green-500" /> 12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.systemHealth}%</div>
                <p className="text-xs text-gray-500 mt-1">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">New employer "Tech Corp" onboarded</span>
                    <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">Invoice #1234 paid by Health Inc</span>
                    <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="text-sm">45 new employees added</span>
                    <span className="text-xs text-gray-500 ml-auto">6 hours ago</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="text-sm">System backup completed</span>
                    <span className="text-xs text-gray-500 ml-auto">12 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Pending Invoices</p>
                      <p className="text-xs text-gray-500">Review and send</p>
                    </div>
                    <Badge variant="secondary">{stats.pendingInvoices}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Support Tickets</p>
                      <p className="text-xs text-gray-500">Awaiting response</p>
                    </div>
                    <Badge variant="secondary">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Employer Requests</p>
                      <p className="text-xs text-gray-500">Pending approval</p>
                    </div>
                    <Badge variant="secondary">2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">System Updates</p>
                      <p className="text-xs text-gray-500">Ready to install</p>
                    </div>
                    <Badge variant="secondary">1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
      </div>
    </AdminLayoutGlass>
  );
}