import { supabase } from '@/lib/supabaseClient';
import { MeditationType } from '@/types/meditation';

/**
 * Start a new meditation session
 */
export async function startMeditationSession(type: MeditationType, userId: string) {
  const { data: log, error } = await supabase
    .from('meditation_logs')
    .insert({
      user_id: userId,
      type,
      duration_minutes: type === 'sleep' ? 10 : 5,
      started_at: new Date() // This is automatic, but can be explicit
    })
    .select()
    .single();

  if (error) throw error;
  return log;
}

/**
 * Complete a meditation session
 */
export async function completeMeditationSession(logId: string) {
  const { error } = await supabase
    .from('meditation_logs')
    .update({
      completed_at: new Date()
    })
    .eq('id', logId);

  if (error) throw error;
  return true;
}

/**
 * Complete pattern for a meditation session
 */
export async function runMeditationSession(type: MeditationType) {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Start session
  const { data: log } = await supabase
    .from('meditation_logs')
    .insert({
      user_id: user.id,
      type,
      duration_minutes: type === 'sleep' ? 10 : 5
    })
    .select()
    .single();

  const logId = log.id;

  // ... meditation happens ...

  // Complete session
  await supabase
    .from('meditation_logs')
    .update({
      completed_at: new Date()
    })
    .eq('id', logId);

  // Optional: Create timeline event
  await supabase.from('patient_timeline_events').insert({
    patient_id: user.id,
    type: 'update',
    label: `Completed ${type} meditation`,
    data: { 
      meditation_log_id: logId,
      duration_minutes: type === 'sleep' ? 10 : 5
    }
  });

  return logId;
}

/**
 * Calculate actual duration if tracking real time
 */
export async function completeMeditationWithActualDuration(logId: string) {
  // First get the start time
  const { data: log } = await supabase
    .from('meditation_logs')
    .select('started_at')
    .eq('id', logId)
    .single();

  if (!log) throw new Error('Log not found');

  const startTime = new Date(log.started_at);
  const endTime = new Date();
  const actualDurationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

  // Update with completion time and actual duration
  await supabase
    .from('meditation_logs')
    .update({
      completed_at: endTime,
      duration_minutes: actualDurationMinutes
    })
    .eq('id', logId);

  return actualDurationMinutes;
}