export async function getPatientVitals() {
  // Simulated data - replace with actual API calls
  return {
    heartRate: '72 bpm',
    sleep: '7.5 hrs',
    protein: '65g',
    hydration: '64 oz',
    steps: '8,432',
    aiLogs: '3'
  }
}

export async function getUpcomingAppointments() {
  // Simulated data - replace with actual API calls
  return [
    {
      title: 'Annual Physical',
      date: 'Aug 15',
      time: '10:00 AM',
      provider: 'Dr. Sarah Chen, MD'
    },
    {
      title: 'Lab Review',
      date: 'Aug 22',
      time: '2:30 PM',
      provider: 'Dr. Chen (Virtual)'
    }
  ]
}