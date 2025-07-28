import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Plus,
  Video,
  Building2,
  Phone,
  ChevronRight,
  CalendarDays,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { format, isPast, isFuture, isToday } from 'date-fns';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  reason?: string;
  notes?: string;
  is_virtual: boolean;
  provider: {
    id: string;
    name: string;
    specialty?: string;
    practice_location?: string;
    phone?: string;
  };
}

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const { userId } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (userId) {
      loadAppointments();
    }
  }, [userId]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // Get patient ID
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!patient) return;

      // Load appointments with provider details
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          provider:providers(
            id,
            user_id,
            specialty,
            practice_location,
            phone
          )
        `)
        .eq('patient_id', patient.id)
        .order('appointment_date', { ascending: false });

      if (error) throw error;

      // Get provider names
      const appointmentsWithNames = await Promise.all((data || []).map(async (apt) => {
        let providerName = 'Provider';
        if (apt.provider?.user_id) {
          const { data: userData } = await supabase
            .from('auth.users')
            .select('raw_user_meta_data')
            .eq('id', apt.provider.user_id)
            .single();
          providerName = userData?.raw_user_meta_data?.name || 'Provider';
        }

        return {
          ...apt,
          provider: {
            ...apt.provider,
            name: providerName
          }
        };
      }));

      setAppointments(appointmentsWithNames);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    isFuture(new Date(apt.appointment_date)) && apt.status === 'scheduled'
  );

  const pastAppointments = appointments.filter(apt => 
    isPast(new Date(apt.appointment_date)) || apt.status !== 'scheduled'
  );

  const getStatusBadge = (status: string, date: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      scheduled: isToday(new Date(date)) 
        ? { variant: 'default', label: 'Today' }
        : { variant: 'secondary', label: 'Scheduled' },
      completed: { variant: 'success', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      no_show: { variant: 'outline', label: 'No Show' }
    };

    const config = variants[status] || variants.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAppointmentIcon = (type: string, isVirtual: boolean) => {
    if (isVirtual) return <Video className="w-5 h-5 text-blue-600" />;
    if (type.toLowerCase().includes('lab')) return <Building2 className="w-5 h-5 text-purple-600" />;
    return <User className="w-5 h-5 text-green-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your upcoming and past appointments
          </p>
        </div>
        <Button 
          onClick={() => navigate('/patient/appointments/new')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Book Appointment
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Appointments */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <Button onClick={() => navigate('/patient/appointments/new')}>
                  Book Your First Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/patient/appointments/${appointment.id}`)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            {getAppointmentIcon(appointment.appointment_type, appointment.is_virtual)}
                          </div>
                          <div className="space-y-2">
                            <div>
                              <h3 className="font-semibold text-lg">{appointment.appointment_type}</h3>
                              <p className="text-sm text-muted-foreground">
                                with {appointment.provider.name}
                                {appointment.provider.specialty && ` • ${appointment.provider.specialty}`}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {format(new Date(appointment.appointment_date), 'EEEE, MMMM d, yyyy')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                {format(new Date(appointment.appointment_date), 'h:mm a')}
                              </div>
                            </div>

                            {appointment.is_virtual ? (
                              <div className="flex items-center gap-1 text-sm text-blue-600">
                                <Video className="w-4 h-4" />
                                Virtual Visit
                              </div>
                            ) : appointment.provider.practice_location && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                {appointment.provider.practice_location}
                              </div>
                            )}

                            {appointment.reason && (
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Reason:</span> {appointment.reason}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(appointment.status, appointment.appointment_date)}
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Past Appointments */}
        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No past appointments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastAppointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-90"
                        onClick={() => navigate(`/patient/appointments/${appointment.id}`)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="p-3 bg-gray-100 rounded-lg">
                            {getAppointmentIcon(appointment.appointment_type, appointment.is_virtual)}
                          </div>
                          <div className="space-y-2">
                            <div>
                              <h3 className="font-semibold">{appointment.appointment_type}</h3>
                              <p className="text-sm text-muted-foreground">
                                with {appointment.provider.name}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {format(new Date(appointment.appointment_date), 'h:mm a')}
                              </div>
                            </div>

                            {appointment.notes && (
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Notes:</span> {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(appointment.status, appointment.appointment_date)}
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-sky-50">
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start" onClick={() => navigate('/patient/care-team')}>
              <Phone className="w-4 h-4 mr-2" />
              Contact Care Team
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/patient/appointments/reschedule')}>
              <Calendar className="w-4 h-4 mr-2" />
              Reschedule Appointment
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/patient/health')}>
              <AlertCircle className="w-4 h-4 mr-2" />
              Prepare for Visit
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}