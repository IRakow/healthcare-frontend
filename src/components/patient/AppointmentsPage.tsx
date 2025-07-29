// File: src/pages/patient/AppointmentsPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppointmentBooking from '@/components/patient/AppointmentBooking';
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

      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' } : apt))
      );

      const { data: { user } } = await supabase.auth.getUser();
      const apt = appointments.find((a) => a.id === id);
      if (user && apt) {
        await supabase.from('patient_timeline_events').insert({
          patient_id: user.id,
          type: 'appointment',
          label: `Cancelled appointment for ${apt.date}`,
          data: { appointment_id: id }
        });
      }
    } catch (error) {
      alert('Failed to cancel appointment.');
    }
  }

  function joinVideoCall(appointment: Appointment) {
    navigate(`/patient/telemed/${appointment.id}`);
  }

  const isUpcoming = (date: string) => new Date(date) >= new Date(new Date().toDateString());

  const groupedAppointments = appointments
    .filter((apt) => {
      if (filter === 'all') return true;
      if (filter === 'upcoming') return isUpcoming(apt.date) && apt.status !== 'cancelled';
      if (filter === 'past') return !isUpcoming(apt.date) || apt.status === 'complete' || apt.status === 'completed';
      return true;
    })
    .reduce((acc, apt) => {
      const formattedDate = new Date(apt.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!acc[formattedDate]) acc[formattedDate] = [];
      acc[formattedDate].push(apt);
      return acc;
    }, {} as Record<string, Appointment[]>);

  const getStatusBadge = (status: string) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      complete: 'bg-green-100 text-green-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-gray-100 text-gray-800'
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-sky-900">📅 My Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all your bookings and visit history.</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/patient')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          {!showBooking ? (
            <Button onClick={() => setShowBooking(true)} className="bg-sky-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setShowBooking(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {(['upcoming', 'past', 'all'] as const).map((tab) => (
            <Button
              key={tab}
              variant={filter === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(tab)}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
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

      {/* Appointment List */}
      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading appointments...</p>
      ) : Object.keys(groupedAppointments).length === 0 ? (
        <Card className="p-6 text-center text-gray-500 italic">No appointments found.</Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([date, dayGroup]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-sky-800">{date}</h3>
              <div className="space-y-3">
                {dayGroup.map((apt) => (
                  <Card key={apt.id} className="p-4 flex justify-between items-start shadow-md border border-gray-100 rounded-xl">
                    <div className="flex gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {apt.type === 'telemed' ? (
                          <Video className="h-6 w-6 text-blue-600" />
                        ) : (
                          <Building2 className="h-6 w-6 text-green-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex gap-2 items-center mb-1">
                          <h4 className="font-medium text-gray-900">{apt.reason}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {apt.time}
                        </p>
                        <p className="text-sm text-gray-500">
                          {apt.type === 'telemed' ? 'Telemedicine' : 'In-Person Visit'}
                        </p>
                      </div>
                    </div>
                    {isUpcoming(apt.date) && apt.status !== 'cancelled' && (
                      <div className="flex gap-2">
                        {apt.type === 'telemed' && apt.status !== 'complete' && (
                          <Button size="sm" onClick={() => joinVideoCall(apt)}>
                            Join Call
                          </Button>
                        )}
                        {apt.status === 'pending' && (
                          <Button size="sm" variant="outline" onClick={() => cancelAppointment(apt.id)}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    )}
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
