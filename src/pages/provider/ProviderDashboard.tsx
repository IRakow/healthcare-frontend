import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Video, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { generateJitsiLink } from '@/utils/videoCall';

interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  date: string;
  time: string;
  type: 'telemed' | 'in-person';
  reason: string;
  status: 'pending' | 'in_progress' | 'complete';
  video_url?: string;
  created_at: string;
  patient?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export default function ProviderDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayCount, setTodayCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'pending'>('today');
  const navigate = useNavigate();

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get appointments with patient information
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:users!appointments_patient_id_fkey(
            id,
            full_name,
            email
          )
        `)
        .eq('provider_id', user.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;

      const appointmentsData = data || [];
      setAppointments(appointmentsData);

      // Count today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayAppts = appointmentsData.filter(
        (a: Appointment) => a.date === today && a.status !== 'complete'
      );
      setTodayCount(todayAppts.length);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateAppointmentStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === id ? { ...apt, status: status as any } : apt
      ));

      // Create timeline event for patient
      const appointment = appointments.find(a => a.id === id);
      if (appointment) {
        await supabase.from('patient_timeline_events').insert({
          patient_id: appointment.patient_id,
          type: 'visit',
          label: `Appointment ${status.replace('_', ' ')}`,
          data: { appointment_id: id, status }
        });
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment status');
    }
  }

  async function startVideoCall(id: string) {
    try {
      // Generate a video room URL using the standard format
      const videoUrl = generateJitsiLink(id);
      
      // Update appointment with video URL and status
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'in_progress',
          video_url: videoUrl 
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === id ? { ...apt, status: 'in_progress', video_url: videoUrl } : apt
      ));

      // Navigate to telemed page
      navigate(`/provider/telemed/${id}`);

      // Create timeline event
      const appointment = appointments.find(a => a.id === id);
      if (appointment) {
        await supabase.from('patient_timeline_events').insert({
          patient_id: appointment.patient_id,
          type: 'visit',
          label: 'Video appointment started',
          data: { appointment_id: id, video_url: videoUrl }
        });
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Failed to start video call');
    }
  }

  const getFilteredAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (filter) {
      case 'today':
        return appointments.filter(a => a.date === today);
      case 'upcoming':
        return appointments.filter(a => a.date >= today && a.status !== 'complete');
      case 'pending':
        return appointments.filter(a => a.status === 'pending');
      default:
        return appointments;
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
      in_progress: { color: 'bg-blue-100 text-blue-700', icon: Video },
      complete: { color: 'bg-green-100 text-green-700', icon: CheckCircle }
    };
    
    const config = configs[status as keyof typeof configs] || configs.pending;
    const Icon = config.icon;
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="text-center py-12 text-gray-500">
          Loading appointments...
        </div>
      </div>
    );
  }

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Provider Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your appointments and patients</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Today's Appointments</p>
          <p className="text-3xl font-bold text-blue-600">{todayCount}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'in_progress').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Week</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => {
                    const date = new Date(a.date);
                    const now = new Date();
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return date >= now && date <= weekFromNow;
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Telemedicine</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.type === 'telemed').length}
                </p>
              </div>
              <Video className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['today', 'upcoming', 'pending', 'all'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No {filter} appointments</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <div className="p-6">
                <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {appointment.type === 'telemed' ? (
                      <Video className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Building2 className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {appointment.patient?.full_name || 'Patient'}
                      </h3>
                      {getStatusBadge(appointment.status)}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {appointment.time}
                      </p>
                      <p className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {appointment.patient?.email}
                      </p>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm font-medium">Reason:</p>
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {appointment.status === 'pending' && (
                    <>
                      {appointment.type === 'telemed' && (
                        <Button
                          size="sm"
                          onClick={() => startVideoCall(appointment.id)}
                        >
                          Start Video Call
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAppointmentStatus(appointment.id, 'complete')}
                      >
                        Mark Complete
                      </Button>
                    </>
                  )}
                  
                  {appointment.status === 'in_progress' && (
                    <>
                      {appointment.video_url && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/provider/telemed/${appointment.id}`)}
                        >
                          Join Video
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAppointmentStatus(appointment.id, 'complete')}
                      >
                        End Call
                      </Button>
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/provider/patient/${appointment.patient_id}`)}
                  >
                    View Patient File
                  </Button>
                </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}