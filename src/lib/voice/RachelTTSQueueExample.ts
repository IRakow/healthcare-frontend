import { speak } from '@/lib/voice/RachelTTSQueue'

// Example usage in admin components
export function exampleUsage() {
  // Queue multiple messages - they'll play in order
  speak('You have 3 providers active.')
  speak('Audit report downloaded.')
  speak('NovaCare is 14 days overdue.')
}

// Example in a React component
export function useRachelNotifications() {
  const notifyOverdue = (count: number, names: string[]) => {
    speak(`${count} employers are overdue.`)
    speak(`They are: ${names.join(', ')}`)
  }

  const confirmAction = (action: string) => {
    speak(`${action} completed successfully.`)
  }

  return { notifyOverdue, confirmAction }
}