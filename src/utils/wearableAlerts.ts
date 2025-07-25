import { supabase } from '@/lib/supabaseClient';

export async function checkWearableAlerts(log: any, patient_id: string) {
  if (log.sleep_hours < 4) {
    await supabase.from('patient_timeline_events').insert({
      patient_id,
      type: 'alert',
      label: 'Low Sleep Detected',
      data: { sleep: log.sleep_hours, date: log.date }
    });
  }
}