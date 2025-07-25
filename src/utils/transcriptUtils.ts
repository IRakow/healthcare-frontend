import { supabase } from '@/lib/supabase';

export async function saveTranscriptLine(appointmentId: string, speaker: string, text: string) {
  await supabase.from('appointment_transcripts').insert({
    appointment_id: appointmentId,
    speaker,
    text
  });
}

export async function getAppointmentTranscript(appointmentId: string) {
  const { data, error } = await supabase
    .from('appointment_transcripts')
    .select('*')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching transcript:', error);
    return [];
  }

  return data || [];
}

export async function formatTranscriptForDisplay(appointmentId: string): Promise<string> {
  const lines = await getAppointmentTranscript(appointmentId);
  
  return lines
    .map(line => `[${line.speaker.toUpperCase()}]: ${line.text}`)
    .join('\n');
}