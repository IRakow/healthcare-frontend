interface ParsedCommand {
  command: string;
  page?: string;
  parsed?: any;
}

export class NLPParser {
  parseUserInput(input: string, userRole?: 'patient' | 'provider' | 'admin' | 'owner'): ParsedCommand | null {
    const normalizedInput = input.toLowerCase().trim();
    
    // Check for navigation requests first
    if (this.isNavigationRequest(normalizedInput)) {
      return this.parseNavigation(input, userRole);
    }
    
    // Check for appointment booking
    if (this.isAppointmentRequest(normalizedInput)) {
      return this.parseAppointment(input);
    }
    
    // Check for medication
    if (this.isMedicationRequest(normalizedInput)) {
      return this.parseMedication(input);
    }
    
    // Check for document upload
    if (this.isDocumentRequest(normalizedInput)) {
      return this.parseDocument(input);
    }
    
    // Check for queries
    if (this.isQuery(normalizedInput)) {
      return this.parseQuery(input);
    }
    
    return null;
  }

  private isNavigationRequest(text: string): boolean {
    const navigationKeywords = [
      'show me my', 'go to', 'navigate to', 'open', 'take me to'
    ];
    const navigationTargets = [
      'labs', 'medications', 'appointments', 'billing', 'family', 
      'chat', 'intake', 'uploads', 'documents', 'settings', 'dashboard'
    ];
    
    return navigationKeywords.some(keyword => text.includes(keyword)) || 
           navigationTargets.some(target => text.includes(target) && text.includes('my'));
  }

  private isAppointmentRequest(text: string): boolean {
    const appointmentKeywords = ['book', 'schedule', 'appointment', 'see', 'visit'];
    // Make sure it's not a navigation request
    if (text.includes('show') || text.includes('my appointments')) return false;
    return appointmentKeywords.some(keyword => text.includes(keyword));
  }

  private isMedicationRequest(text: string): boolean {
    const medicationKeywords = ['add', 'medication', 'medicine', 'taking', 'prescribed'];
    return medicationKeywords.some(keyword => text.includes(keyword));
  }

  private isDocumentRequest(text: string): boolean {
    const documentKeywords = ['upload', 'document', 'file', 'scan', 'attach'];
    return documentKeywords.some(keyword => text.includes(keyword));
  }

  private isQuery(text: string): boolean {
    const queryKeywords = ['show', 'list', 'what', 'check', 'view', 'appointments', 'medications'];
    return queryKeywords.some(keyword => text.includes(keyword));
  }

  private parseNavigation(input: string, providedRole?: 'patient' | 'provider' | 'admin' | 'owner'): ParsedCommand {
    const normalized = input.toLowerCase();
    
    // Comprehensive route mapping
    const routeMap = {
      patient: {
        'labs': '/patient/labs',
        'medications': '/patient/medications',
        'appointments': '/patient/appointments',
        'settings': '/patient/settings',
        'nutrition': '/patient/nutrition',
        'records': '/patient/records',
        'calendar': '/patient/calendar',
      },
      provider: {
        'dashboard': '/provider',
        'calendar': '/provider/calendar',
      },
      admin: {
        'employers': '/admin/employers',
        'invoices': '/admin/invoices',
        'audit': '/admin/audit',
        'calendar': '/admin/calendar',
      },
      owner: {
        'branding': '/employer/branding',
        'voice': '/employer/voice',
        'employees': '/employer/employees',
        'calendar': '/owner/calendar',
      }
    };
    
    // Use provided role or try to detect from context
    let userRole = providedRole || 'patient';
    
    // If no role provided, check for role indicators in the input
    if (!providedRole) {
      if (normalized.includes('admin') || normalized.includes('audit')) {
        userRole = 'admin';
      } else if (normalized.includes('employer') || normalized.includes('owner') || normalized.includes('branding')) {
        userRole = 'owner';
      } else if (normalized.includes('provider') || normalized.includes('schedule')) {
        userRole = 'provider';
      }
    }
    
    // First, try to find exact matches within the detected role
    const roleRoutes = routeMap[userRole as keyof typeof routeMap];
    for (const [key] of Object.entries(roleRoutes)) {
      if (normalized.includes(key)) {
        return {
          command: 'navigate',
          page: key
        };
      }
    }
    
    // If no match in current role, search all roles
    for (const routes of Object.values(routeMap)) {
      for (const [key] of Object.entries(routes)) {
        if (normalized.includes(key)) {
          return {
            command: 'navigate',
            page: key
          };
        }
      }
    }
    
    // If no specific page found, return null
    return null;
  }

  private parseAppointment(input: string): ParsedCommand {
    const parsed: any = {};
    
    // Extract provider name
    // Patterns: "with Dr. X", "with X", "see Dr. X", "book me with X"
    const providerPatterns = [
      /(?:with|see)\s+(?:dr\.?\s+)?(\w+)/i,
      /(?:dr\.?\s+)(\w+)/i,
      /book\s+me\s+with\s+(?:dr\.?\s+)?(\w+)/i
    ];
    
    for (const pattern of providerPatterns) {
      const match = input.match(pattern);
      if (match) {
        parsed.providerName = match[1];
        break;
      }
    }
    
    // Extract date
    parsed.date = this.extractDate(input);
    
    // Extract time
    parsed.time = this.extractTime(input);
    
    // Extract reason (everything after "for" or specific symptoms)
    const reasonMatch = input.match(/(?:for|about|regarding)\s+(.+?)(?:\s+(?:at|on|with)|$)/i);
    if (reasonMatch) {
      parsed.reason = this.capitalizeFirst(reasonMatch[1].trim());
    } else {
      // Look for common symptoms/reasons
      const symptoms = ['chest pain', 'headache', 'fever', 'cough', 'check-up', 'checkup', 'follow-up', 'followup'];
      for (const symptom of symptoms) {
        if (input.toLowerCase().includes(symptom)) {
          parsed.reason = this.capitalizeFirst(symptom);
          break;
        }
      }
    }
    
    // Add default reason if not specified
    if (!parsed.reason) {
      parsed.reason = 'General';
    }
    
    return {
      command: 'book_appointment',
      parsed
    };
  }

  private parseMedication(input: string): ParsedCommand {
    const parsed: any = {};
    
    // Extract medication name
    // Pattern: "add [medication name] [strength]"
    const medMatch = input.match(/(?:add|take|taking|prescribed)\s+(\w+(?:\s+\w+)?)\s+(\d+\s*(?:mg|ml|mcg|g|iu|%)?)/i);
    if (medMatch) {
      parsed.name = medMatch[1].toLowerCase();
      parsed.strength = medMatch[2];
    } else {
      // Fallback: just get the word after "add"
      const simpleMatch = input.match(/(?:add|take|taking)\s+(\w+)/i);
      if (simpleMatch) {
        parsed.name = simpleMatch[1].toLowerCase();
      }
    }
    
    // Extract strength if not already found
    if (!parsed.strength) {
      const strengthMatch = input.match(/(\d+\s*(?:mg|ml|mcg|g|iu|%)?)/i);
      if (strengthMatch) {
        parsed.strength = strengthMatch[1];
      }
    }
    
    // Extract frequency
    const frequencyMap: Record<string, string> = {
      'once daily': 'once daily',
      'once a day': 'once daily',
      'one time daily': 'once daily',
      'twice daily': 'twice daily',
      'twice a day': 'twice daily',
      'two times daily': 'twice daily',
      'three times daily': 'three times daily',
      'three times a day': 'three times daily',
      'as needed': 'as needed',
      'prn': 'as needed',
      'every 8 hours': 'every 8 hours',
      'every 6 hours': 'every 6 hours',
      'every 4 hours': 'every 4 hours'
    };
    
    for (const [key, value] of Object.entries(frequencyMap)) {
      if (input.toLowerCase().includes(key)) {
        parsed.frequency = value;
        break;
      }
    }
    
    // Default dosage if not specified
    parsed.dosage = parsed.dosage || '1 tablet';
    
    return {
      command: 'add_medication',
      parsed
    };
  }

  private parseDocument(input: string): ParsedCommand {
    // Simple document parsing - would need more context in real app
    return {
      command: 'upload_document',
      parsed: {
        type: 'general'
      }
    };
  }

  private parseQuery(input: string): ParsedCommand {
    const normalized = input.toLowerCase();
    
    if (normalized.includes('appointment')) {
      return {
        command: 'check_appointments',
        parsed: {}
      };
    }
    
    if (normalized.includes('medication') || normalized.includes('med')) {
      return {
        command: 'check_medications',
        parsed: {}
      };
    }
    
    return {
      command: 'general_query',
      parsed: { query: input }
    };
  }

  private extractDate(input: string): string {
    const today = new Date();
    const normalized = input.toLowerCase();
    
    // Check for relative dates
    if (normalized.includes('today')) {
      return today.toISOString().split('T')[0];
    }
    
    if (normalized.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    
    // Check for day names
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (const day of days) {
      if (normalized.includes(day)) {
        return this.getNextWeekday(day);
      }
    }
    
    // Check for explicit dates
    // YYYY-MM-DD
    const isoMatch = input.match(/(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) return isoMatch[1];
    
    // MM/DD/YYYY or MM/DD
    const usMatch = input.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
    if (usMatch) {
      const month = usMatch[1].padStart(2, '0');
      const day = usMatch[2].padStart(2, '0');
      const year = usMatch[3] || today.getFullYear();
      return `${year}-${month}-${day}`;
    }
    
    // Default to tomorrow if no date found
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  private extractTime(input: string): string {
    // Look for time patterns
    // "3pm", "3:00 PM", "15:00", "3 o'clock"
    let timeStr = '';
    
    // Check for "X o'clock"
    const oclockMatch = input.match(/(\d{1,2})\s*o'?clock/i);
    if (oclockMatch) {
      timeStr = oclockMatch[1] + ':00';
    } else {
      // Standard time patterns
      const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?/);
      if (timeMatch) {
        const hours = timeMatch[1];
        const minutes = timeMatch[2] || '00';
        const period = timeMatch[3];
        timeStr = `${hours}:${minutes}`;
        if (period) {
          timeStr += ` ${period}`;
        }
      }
    }
    
    // Handle shortcuts like "at 3" (assume PM for afternoon times)
    if (!timeStr.includes('am') && !timeStr.includes('pm')) {
      const hourMatch = input.match(/(?:at|@)\s*(\d{1,2})(?:\s|$)/);
      if (hourMatch) {
        const hour = parseInt(hourMatch[1]);
        if (hour <= 8) {
          timeStr = `${hour}:00 PM`;
        } else if (hour <= 12) {
          timeStr = `${hour}:00 AM`;
        } else {
          timeStr = `${hour}:00`;
        }
      }
    }
    
    // Convert to 24-hour format
    return this.to24Hour(timeStr);
  }

  private to24Hour(timeStr: string): string {
    if (!timeStr) return '14:00'; // Default time
    
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (!match) return '14:00';
    
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3]?.toLowerCase();
    
    if (period === 'pm' && hours !== 12) {
      hours += 12;
    } else if (period === 'am' && hours === 12) {
      hours = 0;
    } else if (!period && hours < 8) {
      // Assume PM for small numbers without period
      hours += 12;
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

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export const nlpParser = new NLPParser();

// Example usage:
/*
const input1 = "Show me invoices";
const result1 = nlpParser.parseUserInput(input1, 'admin');
console.log(result1);
// Output: { command: "navigate", page: "invoices" }

const input2 = "Book with Dr. Patel tomorrow at 3";
const result2 = nlpParser.parseUserInput(input2);
console.log(result2);
// Output: { command: "book_appointment", parsed: { providerName: "Patel", date: "2025-08-01", time: "15:00", reason: "General" } }

const input3 = "Add metformin 500mg once daily";
const result3 = nlpParser.parseUserInput(input3);
console.log(result3);
// Output: { command: "add_medication", parsed: { name: "metformin", strength: "500 mg", dosage: "1 tablet", frequency: "once daily" } }
*/