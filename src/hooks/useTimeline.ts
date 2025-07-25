import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { timelineService, TimelineEventType } from '@/services/timelineService';

interface TimelineEvent {
  id: string;
  patient_id: string;
  type: TimelineEventType;
  label: string;
  data: any;
  created_at: string;
}

export function useTimeline(patientId?: string) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user's ID if not provided
  useEffect(() => {
    if (!patientId) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) loadTimeline(user.id);
      });
    } else {
      loadTimeline(patientId);
    }
  }, [patientId]);

  const loadTimeline = async (id: string, options?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await timelineService.getPatientTimeline(id, options);
      if (result.success) {
        setEvents(result.data || []);
      } else {
        setError('Failed to load timeline');
      }
    } catch (err) {
      setError('Error loading timeline');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (
    type: TimelineEventType,
    label: string,
    data: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const result = await timelineService.createEvent({
        patient_id: patientId || user.id,
        type,
        label,
        data
      });

      if (result.success) {
        // Reload timeline to show new event
        await loadTimeline(patientId || user.id);
      }
      
      return result;
    } catch (err) {
      return { success: false, error: 'Failed to create event' };
    }
  };

  const logAppointment = async (action: 'booked' | 'cancelled', appointmentData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    return timelineService.createAppointmentEvent(
      patientId || user.id,
      action,
      appointmentData
    );
  };

  const logMedication = async (action: 'added' | 'updated', medicationData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    return timelineService.createMedicationEvent(
      patientId || user.id,
      action,
      medicationData
    );
  };

  const logUpload = async (filename: string, uploadData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    return timelineService.createUploadEvent(
      patientId || user.id,
      filename,
      uploadData
    );
  };

  const logAI = async (interaction: string, aiData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    return timelineService.createAIEvent(
      patientId || user.id,
      interaction,
      aiData
    );
  };

  return {
    events,
    loading,
    error,
    reload: () => patientId && loadTimeline(patientId),
    createEvent,
    logAppointment,
    logMedication,
    logUpload,
    logAI
  };
}

// Example usage in a component:
/*
function MyComponent() {
  const { events, logAppointment, logMedication } = useTimeline();

  const handleBooking = async () => {
    await logAppointment('booked', {
      date: '2025-08-01',
      time: '15:00',
      providerName: 'Dr. Smith',
      reason: 'Check-up'
    });
  };

  const handleMedication = async () => {
    await logMedication('added', {
      name: 'lisinopril',
      strength: '10mg',
      frequency: 'once daily'
    });
  };

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          <strong>{event.label}</strong>
          <pre>{JSON.stringify(event.data, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
*/