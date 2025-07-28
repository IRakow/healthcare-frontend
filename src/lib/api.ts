import { supabase } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

export type TimelineItem = {
  id: string
  type: 'encounter' | 'lab' | 'message' | 'upload' | 'note' | 'appointment'
  timestamp: string
  title: string
  description: string
}

export async function getPatientTimelineData(patientId: string): Promise<TimelineItem[]> {
  try {
    const { data, error } = await supabase
      .from('patient_timeline')
      .select('id, type, title, description, created_at')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error fetching patient timeline:', error.message)
      return []
    }

    if (!data || data.length === 0) {
      console.warn('ℹ️ No timeline data found for patient:', patientId)
      return []
    }

    return data.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      timestamp: formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
    }))
  } catch (err) {
    console.error('❌ Unexpected exception in getPatientTimelineData:', err)
    return []
  }
}
