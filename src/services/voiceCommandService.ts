import { supabase } from '@/lib/supabase';

interface CommandResponse {
  reply: string;
  data?: any;
  error?: boolean;
}

export class VoiceCommandService {
  private functionUrl: string;

  constructor() {
    // Get the Edge Function URL from Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.functionUrl = `${supabaseUrl}/functions/v1/voice-commands`;
  }

  async executeCommand(command: string, parsed: any): Promise<CommandResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(this.functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          command,
          parsed
        }),
      });

      const result = await response.json();
      
      if (!response.ok || result.error) {
        throw new Error(result.reply || 'Command execution failed');
      }

      return result;
    } catch (error) {
      console.error('Voice command error:', error);
      return {
        reply: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: true
      };
    }
  }

  // Helper methods for specific commands
  async bookAppointment(date: string, time: string, providerName?: string, reason?: string) {
    return this.executeCommand('book_appointment', {
      date,
      time,
      providerName,
      reason
    });
  }

  async addMedication(name: string, strength?: string, dosage?: string, frequency?: string) {
    return this.executeCommand('add_medication', {
      name,
      strength,
      dosage,
      frequency
    });
  }

  async uploadDocument(filename: string, url: string, type?: string, category?: string) {
    return this.executeCommand('upload_document', {
      filename,
      url,
      type,
      category
    });
  }

  async checkAppointments() {
    return this.executeCommand('check_appointments', {});
  }

  async updateIntake(field: string, value: string, action: 'add' | 'remove' = 'add') {
    return this.executeCommand('update_intake', {
      field,
      value,
      action
    });
  }
}

export const voiceCommandService = new VoiceCommandService();