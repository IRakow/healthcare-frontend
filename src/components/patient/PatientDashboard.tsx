import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  HeartPulse, 
  MessageSquare, 
  Stethoscope, 
  Sparkles,
  Clock,
  AlertCircle,
  FileText,
  Activity,
  Apple,
  Target,
  TrendingUp,
  Bell,
  Loader2,
  ChevronRight,
  Users,
  PillIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface DashboardData {
  upcomingAppointments: Array<{
    id: string;
    date: string;
    time: string;
    provider: string;
    type: string;
  }>;
  unreadMessages: number;
  latestVitals: {
    bloodPressure?: string;
    heartRate?: number;
    weight?: number;
    lastUpdated?: string;
  };
  activeGoals: number;
  medications: Array<{
    id: string;
    name: string;
    nextDose: string;
    remaining: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userId, name } = useUser();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    if (userId) {
      loadDashboardData();
    }
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      // Get patient ID
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!patient) return;

      // Load upcoming appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_type,
          provider:providers(
            user_id
          )
        `)
        .eq('patient_id', patient.id)
        .eq('status', 'scheduled')
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true })
        .limit(3);

      // Get provider names
      const upcomingAppointments = await Promise.all((appointments || []).map(async (apt) => {
        let providerName = 'Provider';
        if (apt.provider?.user_id) {
          const { data: userData } = await supabase
            .from('auth.users')
            .select('raw_user_meta_data')
            .eq('id', apt.provider.user_id)
            .single();
          providerName = userData?.raw_user_meta_data?.name || 'Provider';
        }

        const aptDate = new Date(apt.appointment_date);
        return {
          id: apt.id,
          date: format(aptDate, 'MMM d, yyyy'),
          time: format(aptDate, 'h:mm a'),
          provider: providerName,
          type: apt.appointment_type
        };
      }));

      // Count unread messages
      const { count: unreadMessages } = await supabase
        .from('secure_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .is('read_at', null);

      // Get latest vitals
      const { data: vitalsData } = await supabase
        .from('vitals')
        .select('*')
        .eq('patient_id', patient.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      const latestVitals = vitalsData ? {
        bloodPressure: `${vitalsData.systolic}/${vitalsData.diastolic}`,
        heartRate: vitalsData.heart_rate,
        weight: vitalsData.weight,
        lastUpdated: vitalsData.recorded_at
      } : {};

      // Count active goals
      const { count: activeGoals } = await supabase
        .from('health_goals')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patient.id)
        .eq('status', 'active');

      // Get medications
      const { data: medsData } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('is_active', true)
        .limit(3);

      const medications = (medsData || []).map(med => ({
        id: med.id,
        name: med.medication_name,
        nextDose: med.next_dose_time || 'As directed',
        remaining: med.remaining_doses || 0
      }));

      // Get recent activity from patient timeline
      const { data: activityData } = await supabase
        .from('patient_timeline')
        .select('*')
        .eq('patient_id', patient.id)
        .order('event_date', { ascending: false })
        .limit(5);

      const recentActivity = (activityData || []).map(activity => ({
        id: activity.id,
        type: activity.event_type,
        description: activity.description,
        timestamp: activity.event_date
      }));

      setData({
        upcomingAppointments,
        unreadMessages: unreadMessages || 0,
        latestVitals,
        activeGoals: activeGoals || 0,
        medications,
        recentActivity
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
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
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {greeting}, {name || 'there'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Your health at a glance — beautifully organized
          </p>
        </div>
        <Button
          variant="default"
          className="flex items-center gap-2"
          onClick={() => navigate('/patient/ai')}
        >
          <Sparkles className="w-4 h-4" /> 
          Ask Health AI
        </Button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200"
            onClick={() => navigate('/patient/appointments')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Appointments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">View & Book</p>
                  {data?.upcomingAppointments.length > 0 && (
                    <p className="text-xs text-blue-600 mt-2">
                      Next: {data.upcomingAppointments[0].date}
                    </p>
                  )}
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-br from-red-50 to-pink-50 border-red-200"
            onClick={() => navigate('/patient/health')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Health Overview</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">Vitals & Goals</p>
                  {data?.latestVitals.lastUpdated && (
                    <p className="text-xs text-red-600 mt-2">
                      Updated: {format(new Date(data.latestVitals.lastUpdated), 'MMM d')}
                    </p>
                  )}
                </div>
                <HeartPulse className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 relative"
            onClick={() => navigate('/patient/messages')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Messages</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">Chat Now</p>
                  {data?.unreadMessages > 0 && (
                    <Badge variant="destructive" className="absolute top-2 right-2">
                      {data.unreadMessages}
                    </Badge>
                  )}
                </div>
                <MessageSquare className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200"
            onClick={() => navigate('/patient/care-team')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Care Team</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">View Members</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upcoming Appointments
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/patient/appointments')}
              >
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.upcomingAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No upcoming appointments
              </p>
            ) : (
              <div className="space-y-3">
                {data?.upcomingAppointments.map((apt) => (
                  <div 
                    key={apt.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/patient/appointments/${apt.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-full">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{apt.type}</p>
                        <p className="text-sm text-muted-foreground">
                          with {apt.provider}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{apt.date}</p>
                      <p className="text-sm text-muted-foreground">{apt.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Health Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.latestVitals.bloodPressure && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Blood Pressure</span>
                  <span className="font-medium">{data.latestVitals.bloodPressure}</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            )}
            
            {data?.latestVitals.heartRate && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Heart Rate</span>
                  <span className="font-medium">{data.latestVitals.heartRate} bpm</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
            )}

            {data?.latestVitals.weight && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Weight</span>
                  <span className="font-medium">{data.latestVitals.weight} lbs</span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Goals</span>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{data?.activeGoals || 0}</span>
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/patient/health')}
            >
              View Full Health Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Medications and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <PillIcon className="w-5 h-5" />
                Medications
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/patient/medications')}
              >
                Manage
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.medications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active medications
              </p>
            ) : (
              <div className="space-y-3">
                {data?.medications.map((med) => (
                  <div key={med.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Next dose: {med.nextDose}
                      </p>
                    </div>
                    {med.remaining <= 10 && (
                      <Badge variant="secondary" className="text-xs">
                        {med.remaining} left
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {data?.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="p-1 bg-gray-100 rounded-full mt-1">
                      <Activity className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-sky-50 to-blue-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center gap-2 p-4 bg-white"
              onClick={() => navigate('/patient/appointments/new')}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Book Appointment</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center gap-2 p-4 bg-white"
              onClick={() => navigate('/patient/records')}
            >
              <FileText className="w-6 h-6" />
              <span className="text-sm">View Records</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center gap-2 p-4 bg-white"
              onClick={() => navigate('/patient/nutrition')}
            >
              <Apple className="w-6 h-6" />
              <span className="text-sm">Track Nutrition</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center gap-2 p-4 bg-white"
              onClick={() => navigate('/patient/goals')}
            >
              <Target className="w-6 h-6" />
              <span className="text-sm">Set Goals</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};