import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import PatientLayout from '@/components/layout/PatientLayout'
import { AssistantBar } from '@/components/ai/AssistantBar'
import StatCard from '@/components/ui/StatCard'
import {
  Stethoscope,
  Calendar,
  Bot,
  Moon,
  Apple,
  Droplets,
  Footprints,
  Clock,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getPatientVitals, getUpcomingAppointments } from '@/lib/patientDataService'

export default function PatientDashboard() {
  const [vitals, setVitals] = useState({
    heartRate: '—',
    sleep: '—',
    protein: '—',
    hydration: '—',
    steps: '—',
    aiLogs: '—'
  })

  const [appointments, setAppointments] = useState<any[]>([])

  const [timeline, setTimeline] = useState([
    {
      id: '1',
      icon: '💬',
      title: 'AI Chat – Fatigue & Protein',
      detail: 'Assistant suggested protein-rich snacks.',
      timestamp: 'Today, 9:22 AM'
    },
    {
      id: '2',
      icon: '📁',
      title: 'Uploaded Lab Results',
      detail: 'CBC panel from Quest Diagnostics',
      timestamp: 'Yesterday'
    },
    {
      id: '3',
      icon: '💊',
      title: 'Medication Refill',
      detail: 'Refilled Lisinopril 10mg via CVS',
      timestamp: 'Jul 28'
    }
  ])

  const [aiConversations, setAIConversations] = useState([
    {
      id: '1',
      prompt: 'How do I improve my sleep score?',
      response: 'Try consistent sleep/wake times, reduce blue light at night.',
      timestamp: 'Today, 7:50 AM'
    },
    {
      id: '2',
      prompt: 'Can you interpret my CBC labs?',
      response: 'Your hemoglobin is slightly low. Consider discussing with your doctor.',
      timestamp: 'Yesterday'
    }
  ])

  useEffect(() => {
    getPatientVitals().then(setVitals)
    getUpcomingAppointments().then(setAppointments)
  }, [])

  return (
    <PatientLayout>
      <motion.div
        className="space-y-8 max-w-7xl mx-auto p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-sky-900">Welcome back</h1>
          <p className="text-sm text-gray-500">Here's your personalized health snapshot.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <StatCard label="Heart Rate" value={vitals.heartRate} icon={<Stethoscope className="w-4 h-4" />} description="Resting" />
          <StatCard label="Sleep" value={vitals.sleep} icon={<Moon className="w-4 h-4" />} description="Last Night" />
          <StatCard label="Protein" value={vitals.protein} icon={<Apple className="w-4 h-4" />} description="Today" />
          <StatCard label="Hydration" value={vitals.hydration} icon={<Droplets className="w-4 h-4" />} description="Goal: 80oz" />
          <StatCard label="Steps" value={vitals.steps} icon={<Footprints className="w-4 h-4" />} description="So far" />
          <StatCard label="AI Logs" value={vitals.aiLogs} icon={<Bot className="w-4 h-4" />} description="Today" />
        </div>

        {/* Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Calendar className="w-5 h-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              {appointments.length === 0 ? (
                <li>No upcoming appointments.</li>
              ) : (
                appointments.map((appt, i) => (
                  <li key={i}>
                    📅 {appt.title} – {appt.date} at {appt.time}
                    <br />
                    {appt.provider}
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 text-sm">
              {timeline.map((event) => (
                <li key={event.id} className="flex gap-3">
                  <span className="text-xl">{event.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800">{event.title}</p>
                    <p className="text-gray-500 text-xs">{event.detail}</p>
                    <p className="text-gray-400 text-xs mt-1">{event.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* AI Conversations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-700">
              <MessageSquare className="w-5 h-5" />
              AI Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiConversations.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 bg-white/70 backdrop-blur-sm">
                <p className="text-sm font-semibold text-gray-800">🧠 {entry.prompt}</p>
                <p className="text-sm text-gray-600 mt-2">💬 {entry.response}</p>
                <p className="text-xs text-gray-400 mt-1">{entry.timestamp}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">Open Full History</Button>
          </CardContent>
        </Card>

        {/* AI Assistant */}
        <div className="flex justify-end pt-10">
          <AssistantBar />
        </div>
      </motion.div>
    </PatientLayout>
  )
}