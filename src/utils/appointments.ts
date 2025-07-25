import { supabase } from '@/lib/supabase';

/**
 * Complete an appointment and create a timeline event
 * @param appointmentId - The appointment ID to complete
 * @param patientId - The patient ID for the timeline event
 * @returns Success boolean
 */
export async function completeAppointment(appointmentId: string, patientId: string): Promise<boolean> {
  try {
    // Update appointment status
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'complete' })
      .eq('id', appointmentId);

    if (updateError) throw updateError;

    // Create timeline event
    const { error: timelineError } = await supabase
      .from('patient_timeline_events')
      .insert({
        patient_id: patientId,
        type: 'visit',
        label: 'Appointment Completed',
        data: { appointment_id: appointmentId }
      });

    if (timelineError) throw timelineError;

    return true;
  } catch (error) {
    console.error('Error completing appointment:', error);
    return false;
  }
}

/**
 * Cancel an appointment and create a timeline event
 * @param appointmentId - The appointment ID to cancel
 * @param patientId - The patient ID for the timeline event
 * @returns Success boolean
 */
export async function cancelAppointment(appointmentId: string, patientId: string): Promise<boolean> {
  try {
    // Update appointment status
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId);

    if (updateError) throw updateError;

    // Create timeline event
    const { error: timelineError } = await supabase
      .from('patient_timeline_events')
      .insert({
        patient_id: patientId,
        type: 'appointment',
        label: 'Appointment Cancelled',
        data: { appointment_id: appointmentId }
      });

    if (timelineError) throw timelineError;

    return true;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return false;
  }
}

/**
 * Update appointment status
 * @param appointmentId - The appointment ID to update
 * @param status - The new status
 * @returns Success boolean
 */
export async function updateAppointmentStatus(
  appointmentId: string, 
  status: 'pending' | 'in_progress' | 'complete' | 'cancelled'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return false;
  }
}