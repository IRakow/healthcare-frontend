import { supabase } from '@/lib/supabase';

interface BookingRequest {
  date: string;
  time: string;
  providerName?: string;
  reason?: string;
  type?: 'telemed' | 'in-person';
}

interface Provider {
  id: string;
  full_name: string;
}

export class AppointmentService {
  async handleBookingRequest(parsed: BookingRequest) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Find provider by name if specified
      let providerId = '';
      let providerName = 'next available provider';

      if (parsed.providerName && parsed.providerName.toLowerCase() !== 'anyone') {
        const { data: match } = await supabase
          .from('users')
          .select('id, full_name')
          .ilike('full_name', `%${parsed.providerName}%`)
          .eq('role', 'provider')
          .limit(1)
          .maybeSingle();

        if (match) {
          providerId = match.id;
          providerName = match.full_name;
        }
      }

      // Fallback: find available provider
      if (!providerId) {
        const provider = await this.findAvailableProvider(parsed.date, parsed.time);
        if (provider) {
          providerId = provider.id;
          providerName = provider.full_name;
        } else {
          // Last resort: get any provider
          const { data: providers } = await supabase
            .from('users')
            .select('id, full_name')
            .eq('role', 'provider')
            .limit(1);
          
          if (providers?.[0]) {
            providerId = providers[0].id;
            providerName = providers[0].full_name;
          }
        }
      }

      if (!providerId) {
        throw new Error('No providers available');
      }

      // Create appointment
      const appointment = {
        patient_id: user.id,
        provider_id: providerId,
        date: parsed.date,
        time: parsed.time,
        reason: parsed.reason || 'General Consultation',
        type: parsed.type || 'telemed',
        status: 'pending'
      };

      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert(appointment);

      if (appointmentError) throw appointmentError;

      // Create timeline event
      await supabase.from('patient_timeline_events').insert({
        patient_id: user.id,
        type: 'visit',
        label: `Appointment Booked – ${parsed.date} at ${parsed.time}`,
        data: { 
          reason: appointment.reason, 
          type: appointment.type 
        }
      });

      return `✅ Appointment request submitted with ${providerName} on ${parsed.date} at ${parsed.time}.`;
    } catch (error) {
      console.error('Error booking appointment:', error);
      return `❌ Failed to book appointment: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async findAvailableProvider(date: string, time: string): Promise<Provider | null> {
    try {
      // Get all providers
      const { data: providers } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'provider');

      if (!providers || providers.length === 0) return null;

      // Get existing appointments for that date/time
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('provider_id')
        .eq('date', date)
        .eq('time', time)
        .in('status', ['pending', 'confirmed']);

      const bookedProviderIds = existingAppointments?.map(a => a.provider_id) || [];
      
      // Find first available provider
      const availableProvider = providers.find(p => !bookedProviderIds.includes(p.id));
      
      return availableProvider || null;
    } catch (error) {
      console.error('Error finding available provider:', error);
      return null;
    }
  }

  async cancelAppointment(appointmentId: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get appointment details
      const { data: appointment } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .eq('patient_id', user.id)
        .single();

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Update status
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      // Create timeline event
      await supabase.from('patient_timeline_events').insert({
        patient_id: user.id,
        type: 'visit',
        label: `Appointment Cancelled – ${appointment.date} at ${appointment.time}`,
        data: { 
          appointment_id: appointmentId,
          reason: appointment.reason 
        }
      });

      return `✅ Appointment on ${appointment.date} at ${appointment.time} has been cancelled.`;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return `❌ Failed to cancel appointment: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async getUpcomingAppointments(limit = 5) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          provider:users!appointments_provider_id_fkey(full_name)
        `)
        .eq('patient_id', user.id)
        .gte('date', today)
        .in('status', ['pending', 'confirmed'])
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting appointments:', error);
      return [];
    }
  }
}

export const appointmentService = new AppointmentService();