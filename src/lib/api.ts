import { supabase } from '@/lib/api'

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
      console.error('❌ Error fetching patient timeline:', error.message)
      return []
    }

    return (data || []).map(item => ({
      id: item.id,
      type: item.type,
      timestamp: new Date(item.created_at).toLocaleString(), // format as needed
      title: item.title,
      description: item.description
    }))
  } catch (error) {
    console.error('❌ Exception in getPatientTimelineData:', error)
    return []
  }
}
