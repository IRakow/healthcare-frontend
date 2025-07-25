import { supabase } from '@/lib/supabaseClient';

interface SendSMSParams {
  to: string;
  message: string;
  employerId?: string;
}

export const twilioService = {
  async sendSMS({ to, message, employerId, patientId }: SendSMSParams & { patientId?: string }) {
    try {
      // Get employer's notification sender name if employerId provided
      let senderName = 'Insperity Health';
      
      if (employerId) {
        const { data: employer } = await supabase
          .from('employers')
          .select('notification_sender_name')
          .eq('id', employerId)
          .single();
        
        if (employer?.notification_sender_name) {
          senderName = employer.notification_sender_name;
        }
      }

      // Format message with sender name
      const formattedMessage = `${senderName}: ${message}`;

      // Call Twilio edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to,
          body: formattedMessage
        })
      });

      const data = await response.json();

      // Log to patient timeline if patientId provided
      if (patientId && data.success) {
        await supabase.from('patient_timeline_events').insert({
          patient_id: patientId,
          type: 'message',
          label: `System Notification from ${senderName}`,
          data: { medium: 'SMS', content: message }
        });
      }

      return data;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  },

  async sendAppointmentReminder(appointmentId: string) {
    try {
      // Fetch appointment with patient and employer info
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:users!appointments_patient_id_fkey(
            id,
            full_name,
            phone,
            employer_id
          )
        `)
        .eq('id', appointmentId)
        .single();

      if (!appointment || !appointment.patient?.phone) {
        throw new Error('Appointment or patient phone not found');
      }

      // Get employer's notification sender name
      const employerId = appointment.patient.employer_id;
      let senderName = 'Insperity Health';
      
      if (employerId) {
        const { data: employer } = await supabase
          .from('employers')
          .select('notification_sender_name')
          .eq('id', employerId)
          .single();
        
        senderName = employer?.notification_sender_name || 'Insperity Health';
      }

      // Format appointment reminder message
      const appointmentDate = new Date(appointment.date + ' ' + appointment.time);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const message = `Reminder: You have an appointment scheduled for ${formattedDate} at ${formattedTime}. Reply STOP to unsubscribe.`;

      // Send SMS with employer's sender name
      return await this.sendSMS({
        to: appointment.patient.phone,
        message,
        employerId,
        patientId: appointment.patient.id
      });
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
      throw error;
    }
  },

  async sendTestResultNotification(patientId: string, testType: string) {
    try {
      // Get patient and employer info
      const { data: patient } = await supabase
        .from('users')
        .select('id, full_name, phone, employer_id')
        .eq('id', patientId)
        .single();

      if (!patient?.phone) {
        throw new Error('Patient phone not found');
      }

      // No need to get employer name here since sendSMS will handle it

      const message = `Your ${testType} results are now available. Please log in to your patient portal to view them.`;

      return await this.sendSMS({
        to: patient.phone,
        message,
        employerId: patient.employer_id,
        patientId: patient.id
      });
    } catch (error) {
      console.error('Error sending test result notification:', error);
      throw error;
    }
  }
};