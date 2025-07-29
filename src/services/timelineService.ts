// File: src/services/timelineService.ts

import { supabase } from '@/lib/supabase';

export type TimelineEventType = 'visit' | 'med' | 'upload' | 'ai' | 'update' | 'vitals' | 'lab';

export interface TimelineItem {
  id: string;
  patient_id: string;
  type: TimelineEventType;
  label: string;
  data: any;
  created_at: string;
}

export async function getPatientTimelineData(patient_id: string): Promise<TimelineItem[]> {
  try {
    const { data, error } = await supabase
      .from('patient_timeline_events')
      .select('*')
      .eq('patient_id', patient_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Timeline fetch error:', error.message);
      return [];
    }

    return data as TimelineItem[];
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return [];
  }
}
