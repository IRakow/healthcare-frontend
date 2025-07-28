import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, MapPin, Phone, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Visit {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  reason: string;
  type: 'in-person' | 'telehealth' | 'phone';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  notes?: string;
  chief_complaint?: string;
  has_vitals?: boolean;
  has_soap_note?: boolean;
}

export const ProviderVisitSchedule: React.FC = () => {
  const { userId } = useUser();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    upcoming: 0,
    telehealth: 0
  });

  useEffect(() => {
    if (userId) {
      loadTodaySchedule();
      subscribeToScheduleUpdates();
    }
  }, [userId, selectedDate]);

  const loadTodaySchedule = async () => {
    setLoading(true);
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(
            id,
            user:auth.users(
              email,
              user_metadata
            )
          ),
          vitals:vitals(count),
          soap_note:soap_notes(id)
        `)
        .eq('provider_id', userId)
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString())
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      const formattedVisits = (data || []).map(apt => ({
        ...apt,
        patient_name: apt.patient?.user?.user_metadata?.full_name || 'Unknown Patient',
        patient_email: apt.patient?.user?.email || '',
        has_vitals: apt.vitals?.[0]?.count > 0,
        has_soap_note: !!apt.soap_note
      }));

      setVisits(formattedVisits);
      
      // Calculate stats
      setStats({
        total: formattedVisits.length,
        completed: formattedVisits.filter(v => v.status === 'completed').length,
        upcoming: formattedVisits.filter(v => v.status === 'scheduled').length,
        telehealth: formattedVisits.filter(v => v.type === 'telehealth').length
      });
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToScheduleUpdates = () => {
    const channel = supabase
      .channel(`provider-schedule:${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'appointments',
          filter: `provider_id=eq.${userId}`
        }, 
        () => {
          loadTodaySchedule();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const updateAppointmentStatus = async (appointmentId: string, status: Visit['status']) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;
      
      await loadTodaySchedule();
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  const getStatusColor = (status: Visit['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'cancelled': return 'text-red-600';
      case 'no-show': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: Visit['type']) => {
    switch (type) {
      case 'telehealth': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const isUpcoming = (time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentTime = new Date(selectedDate);
    appointmentTime.setHours(hours, minutes);
    return appointmentTime > now;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> 
          {selectedDate.toLocaleDateString() === new Date().toLocaleDateString() 
            ? "Today's Schedule" 
            : `Schedule for ${selectedDate.toLocaleDateString()}`
          }
        </h3>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="text-sm border rounded-lg px-3 py-1"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
          <p className="text-xs text-muted-foreground">Upcoming</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.telehealth}</p>
          <p className="text-xs text-muted-foreground">Telehealth</p>
        </Card>
      </div>

      {/* Appointments */}
      {visits.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground">No appointments scheduled for this date</p>
        </Card>
      ) : (
        <ul className="space-y-4">
          {visits.map((visit) => (
            <motion.li
              key={visit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-4 border rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800 font-medium">{visit.patient_name}</span>
                      {visit.has_vitals && (
                        <Badge variant="outline" className="text-xs">
                          Vitals ✓
                        </Badge>
                      )}
                      {visit.has_soap_note && (
                        <Badge variant="outline" className="text-xs">
                          SOAP ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{visit.patient_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {visit.appointment_time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {visit.duration_minutes} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      {getTypeIcon(visit.type)}
                      {visit.type === 'in-person' ? visit.location : visit.type}
                    </span>
                    <span className="text-gray-700">{visit.reason}</span>
                  </div>
                  <Badge className={getStatusColor(visit.status)}>
                    {visit.status}
                  </Badge>
                </div>

                {visit.chief_complaint && (
                  <p className="text-sm text-gray-600 italic">
                    Chief complaint: {visit.chief_complaint}
                  </p>
                )}

                {/* Quick Actions */}
                {visit.status === 'scheduled' && isUpcoming(visit.appointment_time) && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAppointmentStatus(visit.id, 'in-progress')}
                    >
                      Start Visit
                    </Button>
                    {visit.type === 'telehealth' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => window.location.href = `/provider/video/${visit.id}`}
                      >
                        <Video className="w-4 h-4 mr-1" />
                        Join Video
                      </Button>
                    )}
                  </div>
                )}

                {visit.status === 'in-progress' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => window.location.href = `/provider/soap/${visit.id}`}
                    >
                      Create SOAP Note
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAppointmentStatus(visit.id, 'completed')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Summary */}
      {visits.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Next appointment</p>
              <p className="text-xs text-muted-foreground">
                {visits.find(v => v.status === 'scheduled' && isUpcoming(v.appointment_time))?.patient_name || 'No upcoming appointments'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/provider/schedule'}>
              <Users className="w-4 h-4 mr-2" />
              Full Schedule
            </Button>
          </div>
        </Card>
      )}
    </motion.div>
  );
};