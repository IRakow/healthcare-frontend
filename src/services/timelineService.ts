import { supabase } from '@/lib/supabase';

export type TimelineEventType = 'visit' | 'med' | 'upload' | 'ai' | 'update' | 'vitals' | 'lab';

interface TimelineEvent {
  patient_id: string;
  type: TimelineEventType;
  label: string;
  data: any;
}

export class TimelineService {
  /**
   * Create a timeline event with consistent structure
   */
  async createEvent(event: TimelineEvent): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('patient_timeline_events')
        .insert(event);

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Timeline event creation failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create timeline event' 
      };
    }
  }

  /**
   * Create appointment-related timeline event
   */
  async createAppointmentEvent(
    patient_id: string,
    action: 'booked' | 'cancelled' | 'completed',
    appointmentData: any
  ) {
    const labels = {
      booked: `Appointment Booked – ${appointmentData.date} at ${appointmentData.time}`,
      cancelled: `Appointment Cancelled – ${appointmentData.date} at ${appointmentData.time}`,
      completed: `Appointment Completed – ${appointmentData.date}`
    };

    return this.createEvent({
      patient_id,
      type: 'visit',
      label: labels[action],
      data: appointmentData
    });
  }

  /**
   * Create medication-related timeline event
   */
  async createMedicationEvent(
    patient_id: string,
    action: 'added' | 'updated' | 'stopped',
    medicationData: any
  ) {
    const labels = {
      added: `Medication Added – ${medicationData.name}`,
      updated: `Medication Updated – ${medicationData.name}`,
      stopped: `Medication Stopped – ${medicationData.name}`
    };

    return this.createEvent({
      patient_id,
      type: 'med',
      label: labels[action],
      data: medicationData
    });
  }

  /**
   * Create document upload timeline event
   */
  async createUploadEvent(
    patient_id: string,
    filename: string,
    uploadData: any
  ) {
    return this.createEvent({
      patient_id,
      type: 'upload',
      label: `Uploaded ${filename}`,
      data: uploadData
    });
  }

  /**
   * Create AI interaction timeline event
   */
  async createAIEvent(
    patient_id: string,
    interaction: string,
    aiData: any
  ) {
    return this.createEvent({
      patient_id,
      type: 'ai',
      label: `AI Assistant – ${interaction}`,
      data: aiData
    });
  }

  /**
   * Create a generic update event (for profile, settings, etc.)
   */
  async createUpdateEvent(
    patient_id: string,
    updateType: string,
    updateData: any
  ) {
    return this.createEvent({
      patient_id,
      type: 'update' as TimelineEventType,
      label: `${updateType} Updated`,
      data: updateData
    });
  }

  /**
   * Get timeline events for a patient
   */
  async getPatientTimeline(
    patient_id: string,
    options?: {
      type?: TimelineEventType;
      limit?: number;
      startDate?: string;
      endDate?: string;
    }
  ) {
    try {
      let query = supabase
        .from('patient_timeline_events')
        .select('*')
        .eq('patient_id', patient_id)
        .order('created_at', { ascending: false });

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.startDate) {
        query = query.gte('created_at', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('created_at', options.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Get timeline statistics for a patient
   */
  async getTimelineStats(patient_id: string) {
    try {
      const { data, error } = await supabase
        .from('patient_timeline_events')
        .select('type')
        .eq('patient_id', patient_id);

      if (error) throw error;

      const stats = data.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return { success: true, stats };
    } catch (error) {
      console.error('Failed to fetch timeline stats:', error);
      return { success: false, stats: {} };
    }
  }
}

export const timelineService = new TimelineService();

// Helper function for backward compatibility
export async function createTimelineEvent(
  patient_id: string,
  type: TimelineEventType,
  label: string,
  data: any
) {
  return timelineService.createEvent({ patient_id, type, label, data });
}