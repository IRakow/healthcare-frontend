import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')!;
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  doctor_name: string;
  appointment_time: string;
  reminder_sent: boolean;
  location?: string;
  notes?: string;
}

serve(async (req) => {
  try {
    const { appointmentId, hoursBeforeAppointment = 24 } = await req.json();

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return new Response(
        JSON.stringify({ error: 'Appointment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if reminder already sent
    if (appointment.reminder_sent) {
      return new Response(
        JSON.stringify({ message: 'Reminder already sent' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Format appointment time
    const appointmentDate = new Date(appointment.appointment_time);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Compose reminder message
    let message = `Hi ${appointment.patient_name}, this is a reminder about your appointment with Dr. ${appointment.doctor_name} on ${formattedDate} at ${formattedTime}.`;
    
    if (appointment.location) {
      message += ` Location: ${appointment.location}.`;
    }
    
    if (appointment.notes) {
      message += ` ${appointment.notes}`;
    }
    
    message += ` Reply CONFIRM to confirm or CANCEL to cancel.`;

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('From', twilioPhoneNumber);
    formData.append('To', appointment.patient_phone);
    formData.append('Body', message);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      return new Response(
        JSON.stringify({ error: twilioResult.message || 'Failed to send SMS' }),
        { status: twilioResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update appointment to mark reminder as sent
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ 
        reminder_sent: true,
        reminder_sent_at: new Date().toISOString(),
        reminder_sms_sid: twilioResult.sid
      })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('Failed to update appointment:', updateError);
    }

    // Log the reminder
    await supabase
      .from('appointment_reminders')
      .insert({
        appointment_id: appointmentId,
        sms_sid: twilioResult.sid,
        sent_to: appointment.patient_phone,
        message: message,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reminder sent successfully',
        sms_sid: twilioResult.sid,
        sent_to: appointment.patient_phone,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});