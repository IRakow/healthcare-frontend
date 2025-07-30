// File: src/pages/patient/PatientHealthDashboard.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PatientLayout from '@/components/layout/PatientLayout';
import { Stethoscope, Calendar, Bot, MessageSquare, Pill, Apple, FileText } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import PatientTimelineViewer from '@/components/patient/PatientTimelineViewer';
import { MedicationManager } from '@/components/patient/MedicationManager';
import DietaryMacroChart from '@/components/nutrition/DietaryMacroChart';
import MealPhotoUpload from '@/components/nutrition/MealPhotoUpload';
import VoiceDietaryInput from '@/components/nutrition/VoiceDietaryInput';
import FileUploadPanel from '@/components/patient/FileUploadPanel';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export default function PatientHealthDashboard() {
  console.log('[PatientHealthDashboard] Component starting to render');
  
  try {
    const navigate = useNavigate();
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState({
      heartRate: '–',
      sleep: '–',
      protein: '–',
      hydration: '–',
      steps: '–',
      aiLogs: '–'
    });
    const [nextAppointment, setNextAppointment] = useState<string | null>(null);

  useEffect(() => {
    console.log('[PatientHealthDashboard] Running auth check');
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        console.log('[PatientHealthDashboard] Auth check result:', { user: data?.user?.email, error });
        if (!data.user) {
          console.log('[PatientHealthDashboard] No user found, redirecting to /login/patient');
          navigate('/login/patient');
        }
      } catch (err) {
        console.error('[PatientHealthDashboard] Auth check error:', err);
        navigate('/login/patient');
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    fetchStats();
    fetchNextAppointment();
  }, []);

  async function fetchStats() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) return;

      const vitals = await supabase
        .from('wearables')
        .select('heart_rate, sleep_hours, hydration_oz, steps')
        .eq('user_id', user.user?.id)
        .order('timestamp', { ascending: false })
        .limit(1);

      const nutrition = await supabase
        .from('nutrition_summary')
        .select('protein_g')
        .eq('user_id', user.user?.id)
        .order('date', { ascending: false })
        .limit(1);

      const logs = await supabase
        .from('ai_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user?.id)
        .gte('created_at', new Date().toISOString().split('T')[0]);

      setStats({
        heartRate: vitals.data?.[0]?.heart_rate + ' bpm' || '–',
        sleep: vitals.data?.[0]?.sleep_hours + ' hrs' || '–',
        protein: nutrition.data?.[0]?.protein_g + 'g' || '–',
        hydration: vitals.data?.[0]?.hydration_oz + ' oz' || '–',
        steps: vitals.data?.[0]?.steps?.toLocaleString() || '–',
        aiLogs: logs.count?.toString() || '0'
      });
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }

  async function fetchNextAppointment() {
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.user?.id)
        .single();

      const { data: appointments } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('patient_id', patient.id)
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date')
        .limit(1);

      if (appointments?.[0]) {
        setNextAppointment(format(new Date(appointments[0].appointment_date), 'MMM d, h:mm a'));
      }
    } catch (e) {
      console.error('Failed to load next appointment', e);
    }
  }

  console.log('[PatientHealthDashboard] About to render JSX');
  
  // Test render without PatientLayout first
  if (!stats) {
    return <div>Loading stats...</div>;
  }
  
  return (
    <PatientLayout>
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-muted-foreground text-sm md:text-base">Your personalized health dashboard</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <StatCard label="Heart Rate" value={stats.heartRate} icon={<Stethoscope className="w-4 h-4" />} description="Resting" />
          <StatCard label="Sleep" value={stats.sleep} icon={<Calendar className="w-4 h-4" />} description="Last Night" />
          <StatCard label="Protein" value={stats.protein} icon={<Apple className="w-4 h-4" />} description="Today" />
          <StatCard label="Hydration" value={stats.hydration} icon={<Bot className="w-4 h-4" />} description="Goal: 80oz" />
          <StatCard label="Steps" value={stats.steps} icon={<Calendar className="w-4 h-4" />} description="So far" />
          <StatCard label="AI Logs" value={stats.aiLogs} icon={<Bot className="w-4 h-4" />} description="Today" />
        </motion.div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" /> Care Team Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => navigate('/patient/messages')}>
                  Go to Messages
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" /> Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {nextAppointment ? `Next: ${nextAppointment}` : 'No appointments booked yet'}
                </p>
                <Button onClick={() => navigate('/patient/appointments')} className="mt-2">
                  Book Appointment
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-violet-600" /> AI Assistant History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  View your recent interactions and assistant responses
                </p>
                <Button variant="ghost" onClick={() => navigate('/patient/ai-history')}>View AI History</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications */}
          <TabsContent value="medications">
            <MedicationManager />
          </TabsContent>

          {/* Nutrition */}
          <TabsContent value="nutrition">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Macro Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <DietaryMacroChart />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Meal Logging</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MealPhotoUpload />
                  <VoiceDietaryInput />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <FileUploadPanel />
          </TabsContent>
        </Tabs>

        {/* Timeline */}
        <div className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" /> Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PatientTimelineViewer patientId="current-user" />
            </CardContent>
          </Card>
        </div>
      </div>
    </PatientLayout>
  );
  } catch (error) {
    console.error('[PatientHealthDashboard] Component render error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h1>
          <p className="text-gray-600">{error?.message || 'An unexpected error occurred'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}
