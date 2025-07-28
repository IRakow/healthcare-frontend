import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminChartLogViewer } from '@/components/admin/AdminChartLogViewer';
import { ExportChartLogPanel } from '@/components/admin/ExportChartLogPanel';
import { 
  FileSearch, 
  Download, 
  BarChart3, 
  Clock, 
  Users, 
  Activity,
  TrendingUp,
  Calendar,
  Filter,
  RefreshCw,
  ChevronRight,
  FileText,
  Stethoscope,
  Heart
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface DashboardStats {
  totalLogs: number;
  todayLogs: number;
  weekLogs: number;
  monthLogs: number;
  soapNotes: number;
  timelineEvents: number;
  activeProviders: number;
  activePatients: number;
  recentActivity: Array<{
    id: string;
    type: string;
    patientName: string;
    providerName: string;
    timestamp: string;
  }>;
  logTypeBreakdown: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export const AdminChartDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  React.useEffect(() => {
    loadDashboardStats();
    const interval = setInterval(loadDashboardStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadDashboardStats = async () => {
    if (!loading) setRefreshing(true);
    
    try {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

      // Get counts for different time periods
      const [
        { count: totalLogs },
        { count: todayLogs },
        { count: weekLogs },
        { count: monthLogs },
        { count: soapNotes },
        { count: timelineEvents }
      ] = await Promise.all([
        supabase.from('patient_timeline').select('*', { count: 'exact', head: true }),
        supabase.from('patient_timeline').select('*', { count: 'exact', head: true })
          .gte('timestamp', today.toISOString()),
        supabase.from('patient_timeline').select('*', { count: 'exact', head: true })
          .gte('timestamp', weekAgo.toISOString()),
        supabase.from('patient_timeline').select('*', { count: 'exact', head: true })
          .gte('timestamp', monthAgo.toISOString()),
        supabase.from('soap_notes').select('*', { count: 'exact', head: true }),
        supabase.from('patient_timeline').select('*', { count: 'exact', head: true })
      ]);

      // Get active providers and patients
      const { data: activeProvidersData } = await supabase
        .from('patient_timeline')
        .select('metadata')
        .gte('timestamp', weekAgo.toISOString());

      const uniqueProviders = new Set(
        activeProvidersData?.map(item => item.metadata?.provider_id).filter(Boolean) || []
      );

      const { data: activePatientsData } = await supabase
        .from('patient_timeline')
        .select('patient_id')
        .gte('timestamp', weekAgo.toISOString());

      const uniquePatients = new Set(activePatientsData?.map(item => item.patient_id) || []);

      // Get recent activity
      const { data: recentData } = await supabase
        .from('patient_timeline')
        .select(`
          id,
          type,
          timestamp,
          patient_id,
          metadata
        `)
        .order('timestamp', { ascending: false })
        .limit(10);

      const recentActivity = await Promise.all((recentData || []).map(async (item) => {
        // Get patient info
        const { data: patient } = await supabase
          .from('patients')
          .select('user_id')
          .eq('id', item.patient_id)
          .single();

        let patientName = 'Unknown Patient';
        if (patient?.user_id) {
          const { data: userData } = await supabase
            .from('auth.users')
            .select('raw_user_meta_data')
            .eq('id', patient.user_id)
            .single();
          patientName = userData?.raw_user_meta_data?.full_name || 'Unknown Patient';
        }

        // Get provider info
        let providerName = 'System';
        if (item.metadata?.provider_id) {
          const { data: provider } = await supabase
            .from('providers')
            .select('user_id')
            .eq('id', item.metadata.provider_id)
            .single();

          if (provider?.user_id) {
            const { data: userData } = await supabase
              .from('auth.users')
              .select('raw_user_meta_data')
              .eq('id', provider.user_id)
              .single();
            providerName = userData?.raw_user_meta_data?.full_name || 'Unknown Provider';
          }
        }

        return {
          id: item.id,
          type: item.type,
          patientName,
          providerName,
          timestamp: item.timestamp
        };
      }));

      // Get log type breakdown
      const { data: typeData } = await supabase
        .from('patient_timeline')
        .select('type')
        .gte('timestamp', monthAgo.toISOString());

      const typeCounts: { [key: string]: number } = {};
      typeData?.forEach(item => {
        typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
      });

      const totalTypeCount = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
      const logTypeBreakdown = Object.entries(typeCounts)
        .map(([type, count]) => ({
          type,
          count,
          percentage: Math.round((count / totalTypeCount) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6); // Top 6 types

      setStats({
        totalLogs: (totalLogs || 0) + (soapNotes || 0),
        todayLogs: todayLogs || 0,
        weekLogs: weekLogs || 0,
        monthLogs: monthLogs || 0,
        soapNotes: soapNotes || 0,
        timelineEvents: timelineEvents || 0,
        activeProviders: uniqueProviders.size,
        activePatients: uniquePatients.size,
        recentActivity,
        logTypeBreakdown
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'soap_note': <Stethoscope className="w-4 h-4" />,
      'clinical_note': <FileText className="w-4 h-4" />,
      'vitals_recorded': <Heart className="w-4 h-4" />,
      'telehealth': <Activity className="w-4 h-4" />
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'soap_note': 'text-purple-600',
      'clinical_note': 'text-blue-600',
      'vitals_recorded': 'text-red-600',
      'telehealth': 'text-green-600',
      'medication_prescribed': 'text-orange-600',
      'lab_ordered': 'text-pink-600'
    };
    return colors[type] || 'text-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Chart Management Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor, analyze, and export patient chart logs across your healthcare system
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadDashboardStats}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Logs</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{stats.totalLogs.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-1">All time</p>
                </div>
                <FileText className="w-8 h-8 text-blue-300" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-green-700">Today's Activity</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{stats.todayLogs}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-green-600">Active</p>
                  </div>
                </div>
                <Clock className="w-8 h-8 text-green-300" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-purple-700">Active Providers</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">{stats.activeProviders}</p>
                  <p className="text-xs text-purple-600 mt-1">Past 7 days</p>
                </div>
                <Users className="w-8 h-8 text-purple-300" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-orange-700">Active Patients</p>
                  <p className="text-3xl font-bold text-orange-900 mt-2">{stats.activePatients}</p>
                  <p className="text-xs text-orange-600 mt-1">Past 7 days</p>
                </div>
                <Activity className="w-8 h-8 text-orange-300" />
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Secondary Stats */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Log Type Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Log Type Distribution
            </h3>
            <div className="space-y-3">
              {stats.logTypeBreakdown.map((item) => (
                <div key={item.type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium flex items-center gap-2 ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                      {item.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-gray-100 ${getTypeColor(activity.type)}`}>
                      {getTypeIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.type.replace(/_/g, ' ')} • {activity.providerName}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.timestamp), 'h:mm a')}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Quick Stats Bar */}
      {!loading && stats && (
        <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex justify-around items-center text-center">
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-xl font-bold">{stats.weekLogs}</p>
            </div>
            <div className="h-8 w-px bg-gray-300" />
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-xl font-bold">{stats.monthLogs}</p>
            </div>
            <div className="h-8 w-px bg-gray-300" />
            <div>
              <p className="text-sm text-muted-foreground">SOAP Notes</p>
              <p className="text-xl font-bold text-purple-600">{stats.soapNotes}</p>
            </div>
            <div className="h-8 w-px bg-gray-300" />
            <div>
              <p className="text-sm text-muted-foreground">Timeline Events</p>
              <p className="text-xl font-bold text-blue-600">{stats.timelineEvents}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileSearch className="w-4 h-4" />
            View Logs
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Center
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="viewer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <AdminChartLogViewer />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="export"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ExportChartLogPanel />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Analytics Placeholder */}
              <Card className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed charts, trends, and insights about your clinical documentation
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card className="p-4 border-dashed">
                    <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Temporal Analysis</p>
                    <p className="text-xs text-muted-foreground">Track patterns over time</p>
                  </Card>
                  <Card className="p-4 border-dashed">
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Provider Metrics</p>
                    <p className="text-xs text-muted-foreground">Documentation efficiency</p>
                  </Card>
                  <Card className="p-4 border-dashed">
                    <Filter className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Custom Reports</p>
                    <p className="text-xs text-muted-foreground">Build your own insights</p>
                  </Card>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};