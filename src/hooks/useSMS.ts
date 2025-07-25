import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface SMSOptions {
  mediaUrl?: string;
  scheduledTime?: string;
}

interface SMSResult {
  status: 'sent' | 'scheduled' | 'error';
  sid?: string;
  error?: string;
}

export function useSMS() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendSMS = useCallback(async (
    to: string,
    body: string,
    options: SMSOptions = {}
  ): Promise<SMSResult> => {
    setSending(true);
    setError(null);

    try {
      const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/twilio-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(supabase as any).supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to,
          body,
          ...options
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to send SMS');
        return { status: 'error', error: result.error };
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { status: 'error', error: errorMessage };
    } finally {
      setSending(false);
    }
  }, []);

  const sendAppointmentReminder = useCallback(async (
    appointmentId: string,
    hoursBeforeAppointment: number = 24
  ): Promise<any> => {
    setSending(true);
    setError(null);

    try {
      const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/appointment-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(supabase as any).supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          appointmentId,
          hoursBeforeAppointment
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to send reminder');
        return { success: false, error: result.error };
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSending(false);
    }
  }, []);

  const sendBulkSMS = useCallback(async (
    recipients: Array<{ to: string; body: string }>,
    options: SMSOptions = {}
  ): Promise<Array<SMSResult>> => {
    setSending(true);
    setError(null);

    try {
      const results = await Promise.all(
        recipients.map(recipient => 
          sendSMS(recipient.to, recipient.body, options)
        )
      );

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return [];
    } finally {
      setSending(false);
    }
  }, [sendSMS]);

  return {
    sendSMS,
    sendAppointmentReminder,
    sendBulkSMS,
    sending,
    error
  };
}