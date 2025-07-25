import { appointmentService } from '@/services/appointmentService';

// Example voice command patterns
const APPOINTMENT_PATTERNS = [
  /book.*appointment.*(?:with\s+)?(dr\.?\s*)?(\w+\s*\w*)?.*(?:on|for)\s+(\d{4}-\d{2}-\d{2})\s+(?:at\s+)?(\d{1,2}:\d{2}\s*(?:am|pm)?)/i,
  /schedule.*(?:with\s+)?(dr\.?\s*)?(\w+\s*\w*)?.*(?:on|for)\s+(\d{4}-\d{2}-\d{2})\s+(?:at\s+)?(\d{1,2}:\d{2}\s*(?:am|pm)?)/i,
  /cancel.*appointment.*(?:on\s+)?(\d{4}-\d{2}-\d{2})?/i,
  /(?:show|list|what).*appointments?/i
];

export async function handleAppointmentCommand(command: string): Promise<string> {
  const lowerCommand = command.toLowerCase();

  // Check for booking request
  if (lowerCommand.includes('book') || lowerCommand.includes('schedule')) {
    const bookingData = parseBookingCommand(command);
    if (bookingData) {
      return await appointmentService.handleBookingRequest(bookingData);
    }
    return "I couldn't understand the appointment details. Please specify a date and time.";
  }

  // Check for cancellation
  if (lowerCommand.includes('cancel')) {
    return "To cancel an appointment, please specify which appointment you'd like to cancel.";
  }

  // Check for listing appointments
  if (lowerCommand.includes('appointment')) {
    const appointments = await appointmentService.getUpcomingAppointments(3);
    if (appointments.length === 0) {
      return "You have no upcoming appointments.";
    }
    
    const list = appointments.map(apt => 
      `• ${apt.date} at ${apt.time} - ${apt.reason} with ${apt.provider?.full_name || 'Provider'}`
    ).join('\n');
    
    return `Your upcoming appointments:\n${list}`;
  }

  return "I can help you book, cancel, or view appointments. What would you like to do?";
}

function parseBookingCommand(command: string): {
  date: string;
  time: string;
  providerName?: string;
  reason?: string;
} | null {
  // Example: "Book appointment with Dr. Smith on 2025-08-01 at 2:00 PM for headache"
  
  // Extract date (YYYY-MM-DD format)
  const dateMatch = command.match(/(\d{4}-\d{2}-\d{2})/);
  if (!dateMatch) return null;
  
  // Extract time
  const timeMatch = command.match(/(\d{1,2}:\d{2}\s*(?:am|pm)?)/i);
  if (!timeMatch) return null;
  
  // Extract provider name (optional)
  const providerMatch = command.match(/(?:with\s+)(dr\.?\s*)?(\w+(?:\s+\w+)?)/i);
  const providerName = providerMatch ? providerMatch[2] : undefined;
  
  // Extract reason (optional)
  const reasonMatch = command.match(/(?:for\s+)([^.]+)$/i);
  const reason = reasonMatch ? reasonMatch[1].trim() : undefined;
  
  return {
    date: dateMatch[1],
    time: normalizeTime(timeMatch[1]),
    providerName,
    reason
  };
}

function normalizeTime(time: string): string {
  // Convert "2:00 PM" to "14:00" format
  const match = time.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (!match) return time;
  
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

// Example usage in a voice assistant component:
/*
const response = await handleAppointmentCommand(
  "Book appointment with Dr. Smith on 2025-08-01 at 2:00 PM for headache"
);
// Returns: "✅ Appointment request submitted with Dr. Smith on 2025-08-01 at 14:00."
*/