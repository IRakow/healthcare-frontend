import { supabase } from '@/lib/supabase';

interface SendEmailParams {
  to: string;
  subject: string;
  templateId: string;
  templateData: Record<string, any>;
  employerId?: string;
}

export const emailService = {
  async getEmployerBranding(employerId?: string) {
    if (!employerId) {
      return {
        notification_sender_name: 'Purity Health',
        primary_color: '#3B82F6',
        logo_url: null,
        tagline: null
      };
    }

    const { data: employer } = await supabase
      .from('employers')
      .select('notification_sender_name, primary_color, logo_url, tagline')
      .eq('id', employerId)
      .single();

    return {
      notification_sender_name: employer?.notification_sender_name || 'Purity Health',
      primary_color: employer?.primary_color || '#3B82F6',
      logo_url: employer?.logo_url,
      tagline: employer?.tagline
    };
  },

  async sendEmail({ to, subject, templateId, templateData, employerId, patientId }: SendEmailParams & { patientId?: string }) {
    try {
      // Get employer branding
      const branding = await this.getEmployerBranding(employerId);
      
      // Merge branding into template data
      const enrichedTemplateData = {
        ...templateData,
        ...branding
      };

      // Call email edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to,
          subject,
          templateId,
          templateData: enrichedTemplateData
        })
      });

      const data = await response.json();

      // Log to patient timeline if patientId provided
      if (patientId && data.success) {
        await supabase.from('patient_timeline_events').insert({
          patient_id: patientId,
          type: 'message',
          label: `System Notification from ${branding.notification_sender_name}`,
          data: { 
            medium: 'Email', 
            subject,
            template: templateId
          }
        });
      }

      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  async sendAppointmentConfirmation(appointmentId: string) {
    try {
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:users!appointments_patient_id_fkey(
            id,
            full_name,
            email,
            employer_id
          ),
          provider:users!appointments_provider_id_fkey(
            full_name
          )
        `)
        .eq('id', appointmentId)
        .single();

      if (!appointment || !appointment.patient?.email) {
        throw new Error('Appointment or patient email not found');
      }

      const branding = await this.getEmployerBranding(appointment.patient.employer_id);
      const senderName = branding.notification_sender_name;

      const appointmentDate = new Date(appointment.date + ' ' + appointment.time);

      return await this.sendEmail({
        to: appointment.patient.email,
        subject: `${senderName} – Appointment Confirmed`,
        templateId: 'appointment-confirmation',
        templateData: {
          patient_name: appointment.patient.full_name,
          provider_name: appointment.provider?.full_name,
          appointment_date: appointmentDate.toLocaleDateString(),
          appointment_time: appointmentDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          appointment_type: appointment.type,
          appointment_reason: appointment.reason
        },
        employerId: appointment.patient.employer_id,
        patientId: appointment.patient.id
      });
    } catch (error) {
      console.error('Error sending appointment confirmation:', error);
      throw error;
    }
  },

  async sendVisitSummary(appointmentId: string, soapNoteId: string) {
    try {
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:users!appointments_patient_id_fkey(
            id,
            full_name,
            email,
            employer_id
          )
        `)
        .eq('id', appointmentId)
        .single();

      if (!appointment || !appointment.patient?.email) {
        throw new Error('Appointment or patient email not found');
      }

      const branding = await this.getEmployerBranding(appointment.patient.employer_id);
      const senderName = branding.notification_sender_name;

      return await this.sendEmail({
        to: appointment.patient.email,
        subject: `${senderName} – Visit Summary Available`,
        templateId: 'visit-summary',
        templateData: {
          patient_name: appointment.patient.full_name,
          visit_date: new Date(appointment.date).toLocaleDateString(),
          portal_link: `${window.location.origin}/patient/visits/${appointmentId}`
        },
        employerId: appointment.patient.employer_id,
        patientId: appointment.patient.id
      });
    } catch (error) {
      console.error('Error sending visit summary:', error);
      throw error;
    }
  },

  async sendLabResults(patientId: string, labResultId: string) {
    try {
      const { data: patient } = await supabase
        .from('users')
        .select('id, full_name, email, employer_id')
        .eq('id', patientId)
        .single();

      if (!patient?.email) {
        throw new Error('Patient email not found');
      }

      const branding = await this.getEmployerBranding(patient.employer_id);
      const senderName = branding.notification_sender_name;

      return await this.sendEmail({
        to: patient.email,
        subject: `${senderName} – New Lab Results Available`,
        templateId: 'lab-results',
        templateData: {
          patient_name: patient.full_name,
          portal_link: `${window.location.origin}/patient/labs/${labResultId}`
        },
        employerId: patient.employer_id,
        patientId: patient.id
      });
    } catch (error) {
      console.error('Error sending lab results notification:', error);
      throw error;
    }
  }
};