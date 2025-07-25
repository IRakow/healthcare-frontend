import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AuditLogViewer from '@/components/audit/AuditLogViewer';
import { Card } from '@/components/ui/card';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  Users,
  FileText,
  Clock,
  BarChart
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditStats {
  totalActions: number;
  uniqueUsers: number;
  securityEvents: number;
  dataChanges: number;
  recentActivity: Array<{
    hour: number;
    count: number;
  }>;
  topActions: Array<{
    action: string;
    count: number;
  }>;
}

export default function AuditDashboard() {
  const [stats, setStats] = useState<AuditStats>({
    totalActions: 0,
    uniqueUsers: 0,
    securityEvents: 0,
    dataChanges: 0,
    recentActivity: [],
    topActions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditStats();
  }, []);

  const fetchAuditStats = async () => {
    try {
      // Get last 7 days of audit logs
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: audit } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (audit) {
        // Calculate statistics
        const totalActions = audit.length;
        const uniqueUsers = new Set(audit.filter(log => log.user_id).map(log => log.user_id)).size;
        
        const securityEvents = audit.filter(log => 
          log.action.toLowerCase().includes('permission') ||
          log.action.toLowerCase().includes('denied') ||
          log.action.toLowerCase().includes('failed')
        ).length;
        
        const dataChanges = audit.filter(log => 
          log.action.toLowerCase().includes('create') ||
          log.action.toLowerCase().includes('update') ||
          log.action.toLowerCase().includes('delete')
        ).length;

        // Calculate hourly activity for last 24 hours
        const last24Hours = audit.filter(log => {
          const logDate = new Date(log.created_at);
          const dayAgo = new Date();
          dayAgo.setDate(dayAgo.getDate() - 1);
          return logDate >= dayAgo;
        });

        const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
        last24Hours.forEach(log => {
          const hour = new Date(log.created_at).getHours();
          hourlyActivity[hour].count++;
        });

        // Calculate top actions
        const actionCounts = audit.reduce((acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const topActions = Object.entries(actionCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([action, count]) => ({ action, count }));

        setStats({
          totalActions,
          uniqueUsers,
          securityEvents,
          dataChanges,
          recentActivity: hourlyActivity,
          topActions
        });
      }
    } catch (error) {
      console.error('Error fetching audit stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RoleGuard roles={['admin', 'owner']}>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard roles={['admin', 'owner']}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Audit Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Actions (7d)</p>
                <p className="text-2xl font-bold">{stats.totalActions}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Security Events</p>
                <p className="text-2xl font-bold">{stats.securityEvents}</p>
              </div>
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Data Changes</p>
                <p className="text-2xl font-bold">{stats.dataChanges}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Activity Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 24-Hour Activity */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              24-Hour Activity
            </h3>
            <div className="h-32 flex items-end gap-1">
              {stats.recentActivity.map((hour) => {
                const maxCount = Math.max(...stats.recentActivity.map(h => h.count));
                const height = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
                return (
                  <div
                    key={hour.hour}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${hour.hour}:00 - ${hour.count} actions`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
          </Card>

          {/* Top Actions */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Top Actions
            </h3>
            <div className="space-y-3">
              {stats.topActions.map((action, index) => (
                <div key={action.action} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-8">{index + 1}.</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{action.action}</span>
                      <span className="text-sm text-gray-600">{action.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ 
                          width: `${(action.count / stats.topActions[0].count) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Security Alerts */}
        {stats.securityEvents > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-900">Security Events Detected</h3>
                <p className="text-sm text-orange-700">
                  {stats.securityEvents} security-related events in the last 7 days. Review the audit logs below.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Audit Log Viewer */}
        <AuditLogViewer />
      </div>
    </RoleGuard>
  );
}