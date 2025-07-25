import { useState } from 'react';
import { appointmentService } from '@/services/appointmentService';

export function useAppointments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookAppointment = async (request: {
    date: string;
    time: string;
    providerName?: string;
    reason?: string;
    type?: 'telemed' | 'in-person';
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await appointmentService.handleBookingRequest(request);
      
      if (result.startsWith('❌')) {
        setError(result);
        return { success: false, message: result };
      }
      
      return { success: true, message: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to book appointment';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await appointmentService.cancelAppointment(appointmentId);
      
      if (result.startsWith('❌')) {
        setError(result);
        return { success: false, message: result };
      }
      
      return { success: true, message: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel appointment';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingAppointments = async (limit?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const appointments = await appointmentService.getUpcomingAppointments(limit);
      return appointments;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load appointments';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    bookAppointment,
    cancelAppointment,
    getUpcomingAppointments,
    loading,
    error
  };
}