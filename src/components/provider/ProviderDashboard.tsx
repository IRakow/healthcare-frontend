import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProviderVisitSchedule } from '@/components/provider/ProviderVisitSchedule';
import { ProviderPatientSearch } from '@/components/provider/ProviderPatientSearch';
import { SOAPSummaryViewer } from '@/components/provider/SOAPSummaryViewer';
import { PatientRiskFlags } from '@/components/provider/PatientRiskFlags';
import { LabReviewPanel } from '@/components/provider/LabReviewPanel';
import { AssistantBar } from '@/components/ai/AssistantBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  FileText, 
  AlertCircle,
  TrendingUp,
  Clock,
  Activity,
  Stethoscope,
  FlaskConical
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  todayAppointments: number;
  pendingLabs: number;
  highRiskPatients: number;
  recentSOAPNotes: number;
  upcomingVisits: Array<{
    time: string;
    patientName: string;
    type: string;
  }>;
}

export const ProviderDashboard: React.FC = () => {
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's appointments
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', userId)
        .gte('appointment_date', today.toISOString())
        .lt('appointment_date', tomorrow.toISOString())
        .eq('status', 'scheduled');

      // Get pending labs
      const { count: labCount } = await supabase
        .from('lab_results')
        .select(`
          *,
          review:lab_reviews!left(status)
        `, { count: 'exact', head: true })
        .is('review.status', null);

      // Get high risk patients
      const { data: riskData } = await supabase
        .from('patient_risk_flags')
        .select('patient_id')
        .eq('severity', 'high')
        .eq('is_active', true);
      
      const uniqueHighRiskPatients = new Set(riskData?.map(r => r.patient_id) || []);

      // Get recent SOAP notes count (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: soapCount } = await supabase
        .from('soap_notes')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', userId)
        .gte('created_at', weekAgo.toISOString());

      // Get upcoming visits (next 3)
      const { data: upcomingData } = await supabase
        .from('appointments')
        .select(`
          appointment_date,
          appointment_type,
          patient:patients(
            id,
            user_id
          )
        `)
        .eq('provider_id', userId)
        .gte('appointment_date', new Date().toISOString())
        .eq('status', 'scheduled')
        .order('appointment_date', { ascending: true })
        .limit(3);

      // Get patient names for upcoming visits
      const upcomingVisits = await Promise.all((upcomingData || []).map(async (apt) => {
        let patientName = 'Unknown Patient';
        if (apt.patient?.user_id) {
          const { data: userData } = await supabase
            .from('auth.users')
            .select('raw_user_meta_data')
            .eq('id', apt.patient.user_id)
            .single();
          patientName = userData?.raw_user_meta_data?.full_name || 'Unknown Patient';
        }

        return {
          time: new Date(apt.appointment_date).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
          }),
          patientName,
          type: apt.appointment_type
        };
      }));

      setStats({
        todayAppointments: appointmentCount || 0,
        pendingLabs: labCount || 0,
        highRiskPatients: uniqueHighRiskPatients.size,
        recentSOAPNotes: soapCount || 0,
        upcomingVisits
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const launchClinicalAI = () => {
    // Navigate to AI command center or open AI assistant modal
    navigate('/provider/ai-assistant');
  };

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
            {greeting}, Dr. {name || 'Provider'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your clinical overview for today
          </p>
        </div>
        <Button 
          variant="default" 
          className="flex items-center gap-2"
          onClick={launchClinicalAI}
        >
          <Sparkles className="w-4 h-4" /> 
          Launch Clinical AI
        </Button>
      </div>

      {/* Quick Stats */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/provider/visits')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Visits</p>
                  <p className="text-3xl font-bold mt-1">{stats.todayAppointments}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/provider/labs')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Labs</p>
                  <p className="text-3xl font-bold mt-1">{stats.pendingLabs}</p>
                  {stats.pendingLabs > 0 && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Review needed
                    </Badge>
                  )}
                </div>
                <FlaskConical className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/provider/risk-flags')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Risk Patients</p>
                  <p className="text-3xl font-bold mt-1">{stats.highRiskPatients}</p>
                  {stats.highRiskPatients > 0 && (
                    <Badge variant="destructive" className="mt-1 text-xs">
                      Attention needed
                    </Badge>
                  )}
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/provider/soap')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">SOAP This Week</p>
                  <p className="text-3xl font-bold mt-1">{stats.recentSOAPNotes}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">Compliant</span>
                  </div>
                </div>
                <FileText className="w-8 h-8 text-green-500" />
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Upcoming Visits Preview */}
      {!loading && stats && stats.upcomingVisits.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Next Appointments
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/provider/visits')}>
              View all
            </Button>
          </div>
          <div className="space-y-3">
            {stats.upcomingVisits.map((visit, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{visit.patientName}</p>
                    <p className="text-sm text-muted-foreground">{visit.type}</p>
                  </div>
                </div>
                <Badge variant="outline">{visit.time}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Dashboard Components */}
      <div className="space-y-6">
        <ProviderVisitSchedule />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProviderPatientSearch />
          <LabReviewPanel />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PatientRiskFlags />
          <SOAPSummaryViewer />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="h-auto flex flex-col items-center gap-2 p-4"
            onClick={() => navigate('/provider/soap/new')}
          >
            <Stethoscope className="w-6 h-6" />
            <span className="text-sm">New SOAP Note</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex flex-col items-center gap-2 p-4"
            onClick={() => navigate('/provider/video')}
          >
            <Activity className="w-6 h-6" />
            <span className="text-sm">Start Telehealth</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex flex-col items-center gap-2 p-4"
            onClick={() => navigate('/provider/prescriptions')}
          >
            <FileText className="w-6 h-6" />
            <span className="text-sm">Prescriptions</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex flex-col items-center gap-2 p-4"
            onClick={() => navigate('/provider/messages')}
          >
            <Users className="w-6 h-6" />
            <span className="text-sm">Messages</span>
          </Button>
        </div>
      </Card>
      
      <div className="flex justify-end px-6 pt-10">
        <AssistantBar />
      </div>
    </motion.div>
  );
};