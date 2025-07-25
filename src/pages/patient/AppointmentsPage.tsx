import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppointmentBooking } from '@/components/patient/AppointmentBooking';
import { ArrowLeft, Calendar, Clock, Video, Building2, Plus, X } from 'lucide-react';
import type { Appointment } from '@/types/appointment';

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function cancelAppointment(id: string) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === id ? { ...apt, status: 'cancelled' } : apt
      ));

      // Create timeline event
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const apt = appointments.find(a => a.id === id);
        await supabase.from('patient_timeline_events').insert({
          patient_id: user.id,
          type: 'appointment',
          label: `Cancelled appointment for ${apt?.date}`,
          data: { appointment_id: id }
        });
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  }

  async function joinVideoCall(appointment: Appointment) {
    navigate(`/patient/telemed/${appointment.id}`);
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      complete: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      confirmed: 'bg-green-100 text-green-700', // For backward compatibility
      completed: 'bg-gray-100 text-gray-700' // For backward compatibility
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const isUpcoming = (date: string) => {
    return new Date(date) >= new Date(new Date().toDateString());
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return isUpcoming(apt.date) && apt.status !== 'cancelled' && apt.status !== 'complete' && apt.status !== 'completed';
    if (filter === 'past') return !isUpcoming(apt.date) || apt.status === 'complete' || apt.status === 'completed';
    return true;
  });

  const groupedAppointments = filteredAppointments.reduce((acc, apt) => {
    const date = new Date(apt.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your healthcare appointments</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/patient')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 items-center">
        {!showBooking ? (
          <Button onClick={() => setShowBooking(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Book New Appointment
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setShowBooking(false)}>
            <X className="mr-2 h-4 w-4" />
            Cancel Booking
          </Button>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 ml-auto">
          {(['upcoming', 'past', 'all'] as const).map(f => (
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
      </div>

      {/* Booking Form */}
      {showBooking && (
        <AppointmentBooking
          onSuccess={() => {
            setShowBooking(false);
            loadAppointments();
          }}
        />
      )}

      {/* Appointments List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">
          Loading appointments...
        </div>
      ) : Object.keys(groupedAppointments).length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {filter === 'upcoming' ? 'No upcoming appointments' : 
               filter === 'past' ? 'No past appointments' : 
               'No appointments scheduled'}
            </p>
            {filter === 'upcoming' && !showBooking && (
              <Button
                className="mt-4"
                onClick={() => setShowBooking(true)}
              >
                Book Your First Appointment
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
            <div key={date}>
              <h3 className="font-semibold text-lg mb-3">{date}</h3>
              <div className="space-y-3">
                {dayAppointments.map(apt => (
                  <Card key={apt.id}>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          {apt.type === 'telemed' ? (
                            <Video className="h-6 w-6 text-blue-600" />
                          ) : (
                            <Building2 className="h-6 w-6 text-green-600" />
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{apt.reason}</h4>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                              {apt.status === 'in_progress' ? 'in progress' : apt.status}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {apt.time}
                            </p>
                            <p className="flex items-center gap-1">
                              {apt.type === 'telemed' ? 'Telemedicine' : 'In-Person Visit'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {isUpcoming(apt.date) && apt.status !== 'cancelled' && apt.status !== 'complete' && apt.status !== 'completed' && (
                        <div className="flex gap-2">
                          {apt.type === 'telemed' && (apt.status === 'in_progress' || (apt.status === 'pending' && apt.video_url)) && (
                            <Button 
                              size="sm"
                              onClick={() => joinVideoCall(apt)}
                            >
                              {apt.status === 'in_progress' ? 'Join Video Call' : 'Join Call'}
                            </Button>
                          )}
                          {apt.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelAppointment(apt.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}