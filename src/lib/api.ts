import { supabase } from './supabase'

// Mock data for demonstration
const mockTimelineData = [
  {
    id: '1',
    type: 'encounter' as const,
    timestamp: '2 hours ago',
    title: 'Annual Physical Exam',
    description: 'Dr. Sarah Johnson - Routine checkup completed'
  },
  {
    id: '2',
    type: 'lab' as const,
    timestamp: '1 day ago',
    title: 'Blood Work Results',
    description: 'CBC, Metabolic Panel - All values within normal range'
  },
  {
    id: '3',
    type: 'message' as const,
    timestamp: '3 days ago',
    title: 'Message from Dr. Johnson',
    description: 'Your prescription has been renewed for 90 days'
  },
  {
    id: '4',
    type: 'upload' as const,
    timestamp: '1 week ago',
    title: 'X-Ray Images Uploaded',
    description: 'Chest X-Ray - No abnormalities detected'
  },
  {
    id: '5',
    type: 'note' as const,
    timestamp: '2 weeks ago',
    title: 'Clinical Note Added',
    description: 'Patient reported improved symptoms after medication adjustment'
  },
  {
    id: '6',
    type: 'appointment' as const,
    timestamp: '1 month ago',
    title: 'Follow-up Appointment',
    description: 'Discussed treatment plan and medication adjustments'
  }
]

export async function getPatientTimelineData(patientId: string) {
  try {
    // In production, this would fetch from Supabase
    // const { data, error } = await supabase
    //   .from('patient_timeline')
    //   .select('*')
    //   .eq('patient_id', patientId)
    //   .order('created_at', { ascending: false })
    
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
    return mockTimelineData
  } catch (error) {
    console.error('Error fetching timeline data:', error)
    return []
  }
}