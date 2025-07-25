import { supabase } from '@/lib/supabase';

interface AiIntentResponse {
  reply: string;
  data?: any;
  action?: string;
  success: boolean;
}

export class AiIntentService {
  private baseUrl: string;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.baseUrl = supabaseUrl.replace('/rest/v1', '');
  }

  async handleAiIntent(
    parsed: any,
    command: string
  ): Promise<AiIntentResponse> {
    try {
      // Get current user and session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          reply: 'Please log in to use this feature.',
          success: false
        };
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return {
          reply: 'Session expired. Please log in again.',
          success: false
        };
      }

      // Call the edge function with proper authentication
      const response = await fetch(`${this.baseUrl}/functions/v1/voice-commands`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          parsed,
          command
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      const json = await response.json();
      
      return {
        reply: json.reply || 'Command processed successfully',
        data: json.data,
        action: command,
        success: !json.error
      };
    } catch (error) {
      console.error('AI Intent Error:', error);
      return {
        reply: `Sorry, I couldn't process that request. ${error instanceof Error ? error.message : ''}`,
        success: false
      };
    }
  }

  // Specific intent handlers with better parsing
  async handleAppointmentIntent(text: string): Promise<AiIntentResponse> {
    // Parse appointment request from natural language
    const parsed = this.parseAppointmentRequest(text);
    
    if (!parsed.date || !parsed.time) {
      return {
        reply: 'I need both a date and time to book an appointment. Please specify when you\'d like to schedule.',
        success: false
      };
    }

    return this.handleAiIntent(parsed, 'book_appointment');
  }

  async handleMedicationIntent(text: string): Promise<AiIntentResponse> {
    // Parse medication info from natural language
    const parsed = this.parseMedicationRequest(text);
    
    if (!parsed.name) {
      return {
        reply: 'Please specify the name of the medication you want to add.',
        success: false
      };
    }

    return this.handleAiIntent(parsed, 'add_medication');
  }

  async handleQueryIntent(text: string): Promise<AiIntentResponse> {
    const lowerText = text.toLowerCase();
    
    // Check for appointment queries
    if (lowerText.includes('appointment')) {
      return this.handleAiIntent({}, 'check_appointments');
    }
    
    // Check for medication queries
    if (lowerText.includes('medication') || lowerText.includes('med')) {
      return this.handleAiIntent({}, 'check_medications');
    }
    
    // Default response
    return {
      reply: 'I can help you book appointments, manage medications, upload documents, and update your medical history. What would you like to do?',
      success: true
    };
  }

  // Helper parsing methods
  private parseAppointmentRequest(text: string): any {
    const parsed: any = {};
    
    // Extract date (various formats)
    const datePatterns = [
      /(\d{4}-\d{2}-\d{2})/,                    // YYYY-MM-DD
      /(\d{1,2}\/\d{1,2}\/\d{4})/,             // MM/DD/YYYY
      /(tomorrow|today|next\s+\w+day)/i,        // Relative dates
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        parsed.date = this.normalizeDate(match[1]);
        break;
      }
    }
    
    // Extract time
    const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm))/i);
    if (timeMatch) {
      parsed.time = this.normalizeTime(timeMatch[1]);
    }
    
    // Extract provider name
    const providerMatch = text.match(/(?:with\s+|dr\.?\s*|doctor\s+)(\w+(?:\s+\w+)?)/i);
    if (providerMatch) {
      parsed.providerName = providerMatch[1];
    }
    
    // Extract reason
    const reasonMatch = text.match(/(?:for\s+|about\s+|regarding\s+)([^.]+?)(?:\s+with|\s+at|\s+on|$)/i);
    if (reasonMatch) {
      parsed.reason = reasonMatch[1].trim();
    }
    
    // Determine type
    parsed.type = text.toLowerCase().includes('in-person') ? 'in-person' : 'telemed';
    
    return parsed;
  }

  private parseMedicationRequest(text: string): any {
    const parsed: any = {};
    
    // Extract medication name (usually after "add" or "take")
    const nameMatch = text.match(/(?:add|take|taking)\s+(\w+(?:\s+\w+)?)/i);
    if (nameMatch) {
      parsed.name = nameMatch[1];
    }
    
    // Extract strength
    const strengthMatch = text.match(/(\d+\s*(?:mg|ml|g|mcg|iu|%)?)/i);
    if (strengthMatch) {
      parsed.strength = strengthMatch[1];
    }
    
    // Extract frequency
    const frequencies = {
      'once a day': 'Once daily',
      'twice a day': 'Twice daily',
      'three times': 'Three times daily',
      'as needed': 'As needed',
      'every': 'Custom'
    };
    
    for (const [key, value] of Object.entries(frequencies)) {
      if (text.toLowerCase().includes(key)) {
        parsed.frequency = value;
        break;
      }
    }
    
    // Extract dosage
    const dosageMatch = text.match(/(\d+)\s*(?:tablet|pill|capsule|ml|drop)s?/i);
    if (dosageMatch) {
      parsed.dosage = dosageMatch[0];
    }
    
    return parsed;
  }

  private normalizeDate(dateStr: string): string {
    const today = new Date();
    
    // Handle relative dates
    if (dateStr.toLowerCase() === 'today') {
      return today.toISOString().split('T')[0];
    } else if (dateStr.toLowerCase() === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    } else if (dateStr.toLowerCase().includes('next')) {
      // Handle "next Monday", etc.
      const dayMatch = dateStr.match(/next\s+(\w+day)/i);
      if (dayMatch) {
        return this.getNextWeekday(dayMatch[1]);
      }
    }
    
    // Convert MM/DD/YYYY to YYYY-MM-DD
    const usDateMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (usDateMatch) {
      const [_, month, day, year] = usDateMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateStr;
  }

  private normalizeTime(timeStr: string): string {
    // Handle formats like "2pm" -> "2:00 PM"
    let normalized = timeStr.replace(/(\d+)(am|pm)/i, '$1:00 $2');
    
    // Convert to 24-hour format
    const match = normalized.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (!match) return timeStr;
    
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3]?.toLowerCase();
    
    if (period === 'pm' && hours !== 12) {
      hours += 12;
    } else if (period === 'am' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  private getNextWeekday(dayName: string): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const todayDay = today.getDay();
    const targetDay = days.findIndex(d => d.startsWith(dayName.toLowerCase()));
    
    if (targetDay === -1) return today.toISOString().split('T')[0];
    
    let daysUntilTarget = targetDay - todayDay;
    if (daysUntilTarget <= 0) daysUntilTarget += 7;
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    
    return targetDate.toISOString().split('T')[0];
  }
}

export const aiIntentService = new AiIntentService();

// Convenience export for backward compatibility
export async function handleAiIntent(userId: string, parsed: any, command: string) {
  const result = await aiIntentService.handleAiIntent(parsed, command);
  return result.reply;
}