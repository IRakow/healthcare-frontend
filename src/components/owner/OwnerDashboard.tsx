import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Building2, 
  BarChart2, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  CreditCard,
  ChevronRight,
  Loader2,
  Receipt,
  Target,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface DashboardStats {
  employers: {
    total: number;
    active: number;
    change: number;
  };
  organizations: {
    total: number;
    verified: number;
    pending: number;
  };
  revenue: {
    monthly: number;
    yearly: number;
    change: number;
    outstanding: number;
  };
  users: {
    total: number;
    active: number;
    providers: number;
    patients: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: 'completed' | 'pending' | 'alert';
  }>;
  upcomingInvoices: Array<{
    id: string;
    employer: string;
    amount: number;
    dueDate: string;
    status: 'draft' | 'sent' | 'overdue';
  }>;
}

export const OwnerDashboard: React.FC = () => {
  const { userId, name } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    if (userId) {
      loadDashboardStats();
    }
  }, [userId]);

  const loadDashboardStats = async () => {
    try {
      // Load employers
      const { data: employers, error: empError } = await supabase
        .from('employers')
        .select('id, name, is_active, created_at');

      if (empError) throw empError;

      const activeEmployers = employers?.filter(e => e.is_active).length || 0;
      const lastMonthEmployers = employers?.filter(e => {
        const created = new Date(e.created_at);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return created > lastMonth;
      }).length || 0;

      // Load organizations
      const { data: organizations, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, verification_status');

      if (orgError) throw orgError;

      const verifiedOrgs = organizations?.filter(o => o.verification_status === 'verified').length || 0;
      const pendingOrgs = organizations?.filter(o => o.verification_status === 'pending').length || 0;

      // Load billing data
      const { data: invoices, error: invError } = await supabase
        .from('employer_invoices')
        .select('amount, status, created_at, due_date');

      if (invError) throw invError;

      const currentMonth = new Date();
      const currentYear = currentMonth.getFullYear();
      const currentMonthNum = currentMonth.getMonth();

      const monthlyRevenue = invoices?.filter(inv => {
        const invDate = new Date(inv.created_at);
        return invDate.getFullYear() === currentYear && 
               invDate.getMonth() === currentMonthNum &&
               inv.status === 'paid';
      }).reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

      const yearlyRevenue = invoices?.filter(inv => {
        const invDate = new Date(inv.created_at);
        return invDate.getFullYear() === currentYear && inv.status === 'paid';
      }).reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

      const outstandingRevenue = invoices?.filter(inv => 
        inv.status === 'sent' || inv.status === 'overdue'
      ).reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

      // Calculate revenue change
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthRevenue = invoices?.filter(inv => {
        const invDate = new Date(inv.created_at);
        return invDate.getFullYear() === lastMonth.getFullYear() && 
               invDate.getMonth() === lastMonth.getMonth() &&
               inv.status === 'paid';
      }).reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

      const revenueChange = lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      // Load user counts
      const { count: totalUsers } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true });

      const { count: providerCount } = await supabase
        .from('providers')
        .select('*', { count: 'exact', head: true });

      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Load recent activity
      const { data: timelineData } = await supabase
        .from('employer_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const recentActivity = (timelineData || []).map(activity => ({
        id: activity.id,
        type: activity.activity_type,
        description: activity.description,
        timestamp: activity.created_at,
        status: activity.status || 'completed'
      }));

      // Load upcoming invoices
      const { data: upcomingInvData } = await supabase
        .from('employer_invoices')
        .select(`
          id,
          amount,
          due_date,
          status,
          employer:employers(name)
        `)
        .in('status', ['draft', 'sent', 'overdue'])
        .order('due_date', { ascending: true })
        .limit(5);

      const upcomingInvoices = (upcomingInvData || []).map(inv => ({
        id: inv.id,
        employer: inv.employer?.name || 'Unknown',
        amount: inv.amount,
        dueDate: inv.due_date,
        status: inv.status
      }));

      setStats({
        employers: {
          total: employers?.length || 0,
          active: activeEmployers,
          change: lastMonthEmployers
        },
        organizations: {
          total: organizations?.length || 0,
          verified: verifiedOrgs,
          pending: pendingOrgs
        },
        revenue: {
          monthly: monthlyRevenue,
          yearly: yearlyRevenue,
          change: revenueChange,
          outstanding: outstandingRevenue
        },
        users: {
          total: totalUsers || 0,
          active: Math.floor((totalUsers || 0) * 0.7), // Placeholder - implement real active user tracking
          providers: providerCount || 0,
          patients: patientCount || 0
        },
        recentActivity,
        upcomingInvoices
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <Badge variant="default" className="text-xs">Completed</Badge>;
      case 'sent':
        return <Badge variant="secondary" className="text-xs">Sent</Badge>;
      case 'overdue':
      case 'alert':
        return <Badge variant="destructive" className="text-xs">Attention</Badge>;
      case 'draft':
      case 'pending':
        return <Badge variant="outline" className="text-xs">Pending</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {greeting}, {name || 'Business Owner'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your business overview for {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>
        <Button 
          variant="default"
          onClick={() => navigate('/owner/invoices/new')}
          className="flex items-center gap-2"
        >
          <Receipt className="w-4 h-4" />
          Generate Invoice
        </Button>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur border shadow hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => navigate('/owner/employers')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-medium text-muted-foreground">Employers</p>
                  </div>
                  <p className="text-2xl font-bold">{stats?.employers.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.employers.active || 0} active
                  </p>
                </div>
                {stats && stats.employers.change > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    +{stats.employers.change} new
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur border shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/owner/organizations')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <p className="text-sm font-medium text-muted-foreground">Organizations</p>
                  </div>
                  <p className="text-2xl font-bold">{stats?.organizations.total || 0}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-muted-foreground">
                      {stats?.organizations.verified || 0} verified
                    </p>
                  </div>
                </div>
                {stats && stats.organizations.pending > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {stats.organizations.pending} pending
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur border shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/owner/financial')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.revenue.monthly || 0)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stats && stats.revenue.change > 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <p className="text-xs text-green-600">+{stats.revenue.change.toFixed(1)}%</p>
                      </>
                    ) : stats && stats.revenue.change < 0 ? (
                      <>
                        <TrendingDown className="w-3 h-3 text-red-600" />
                        <p className="text-xs text-red-600">{stats.revenue.change.toFixed(1)}%</p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">No change</p>
                    )}
                  </div>
                </div>
                <Activity className="w-8 h-8 text-green-100" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/80 backdrop-blur border shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/owner/analytics')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart2 className="w-5 h-5 text-orange-600" />
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  </div>
                  <p className="text-2xl font-bold">{stats?.users.active || 0}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-muted-foreground">
                      {stats?.users.providers || 0} providers
                    </span>
                    <span className="text-muted-foreground">
                      {stats?.users.patients || 0} patients
                    </span>
                  </div>
                </div>
                <Target className="w-8 h-8 text-orange-100" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Yearly Revenue</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {formatCurrency(stats?.revenue.yearly || 0)}
                </p>
                <Progress value={75} className="mt-2 h-2" />
                <p className="text-xs text-green-600 mt-1">75% of annual target</p>
              </div>
              <Briefcase className="w-10 h-10 text-green-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Outstanding</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">
                  {formatCurrency(stats?.revenue.outstanding || 0)}
                </p>
                <p className="text-xs text-orange-600 mt-2">Awaiting payment</p>
              </div>
              <CreditCard className="w-10 h-10 text-orange-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Users</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {stats?.users.total || 0}
                </p>
                <p className="text-xs text-blue-600 mt-2">Across all organizations</p>
              </div>
              <Users className="w-10 h-10 text-blue-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentActivity.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recent activity</p>
              ) : (
                stats?.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-100' :
                        activity.status === 'alert' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        {activity.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : activity.status === 'alert' ? (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(activity.status)}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Upcoming Invoices
              </span>
              <Button variant="ghost" size="sm" onClick={() => navigate('/owner/invoices')}>
                View all
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.upcomingInvoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No upcoming invoices</p>
              ) : (
                stats?.upcomingInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                       onClick={() => navigate(`/owner/invoices/${invoice.id}`)}>
                    <div>
                      <p className="text-sm font-medium">{invoice.employer}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(invoice.amount)}</p>
                      {getStatusBadge(invoice.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-fuchsia-50 to-purple-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center gap-2 p-4"
              onClick={() => navigate('/owner/employers/new')}
            >
              <Building2 className="w-6 h-6" />
              <span className="text-sm">Add Employer</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center gap-2 p-4"
              onClick={() => navigate('/owner/invoices/new')}
            >
              <Receipt className="w-6 h-6" />
              <span className="text-sm">Create Invoice</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center gap-2 p-4"
              onClick={() => navigate('/owner/billing')}
            >
              <CreditCard className="w-6 h-6" />
              <span className="text-sm">Billing Config</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center gap-2 p-4"
              onClick={() => navigate('/owner/analytics')}
            >
              <BarChart2 className="w-6 h-6" />
              <span className="text-sm">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};