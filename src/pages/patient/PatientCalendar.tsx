// src/pages/patient/PatientCalendar.tsx

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import PatientLayout from '@/components/layout/PatientLayout'
import { CalendarDays, Stethoscope } from 'lucide-react'

const events = [
  { date: 'Aug 3', time: '2:00 PM', type: 'Checkup', provider: 'Dr. Smith' },
  { date: 'Aug 6', time: '9:30 AM', type: 'Telemed', provider: 'Dr. Patel' }
]

export default function PatientCalendar() {
  return (
    <PatientLayout>
      <Card className="glass-card max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sky-700">
            <CalendarDays className="w-5 h-5" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-700">
          {events.map((e, i) => (
            <div key={i} className="flex justify-between border-b pb-2 border-gray-200">
              <div>
                <p className="font-semibold">{e.type} – {e.date}, {e.time}</p>
                <p className="text-xs text-gray-500">With {e.provider}</p>
              </div>
              <button className="text-blue-600 hover:underline text-sm">View / Join</button>
            </div>
          ))}
        </CardContent>
      </Card>
    </PatientLayout>
  )
}