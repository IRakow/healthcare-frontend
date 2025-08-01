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
  MessageSquare,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VitalsStrip } from '@/components/patient/VitalsStrip'
import { PatientTimelinePanel } from '@/components/patient/PatientTimelinePanel'
import { AIChatHistoryPanel } from '@/components/patient/AIChatHistoryPanel'
import { UploadsPanel } from '@/components/patient/UploadsPanel'

const vitals = [
  { label: 'Hydration', value: '64 oz', icon: <Droplets className="w-4 h-4" />, description: 'Goal: 80 oz' },
  { label: 'Sleep', value: '6.8 hrs', icon: <Moon className="w-4 h-4" />, description: 'Last Night' },
  { label: 'Protein', value: '58g', icon: <Apple className="w-4 h-4" />, description: 'Today' },
  { label: 'Steps', value: '7,412', icon: <Footprints className="w-4 h-4" />, description: 'So far' }
]

const timeline = [
  { icon: '🤖', title: 'AI Follow-up', detail: 'Assistant flagged dehydration.', time: 'Today, 10:42 AM' },
  { icon: '🧪', title: 'CBC Result', detail: 'Low hemoglobin. Flagged for review.', time: 'Yesterday' },
  { icon: '📁', title: 'Uploaded X-ray Report', detail: 'MyChart upload.', time: 'Monday' },
  { icon: '💊', title: 'Prescription Refill', detail: 'Lisinopril 10mg via CVS.', time: 'Last Week' }
]

const chats = [
  { prompt: 'Interpret my lab results?', response: 'WBC normal. Hemoglobin low.', time: 'Today, 9:12 AM' },
  { prompt: 'High-protein breakfast ideas?', response: 'Greek yogurt with almonds and seeds.', time: 'Yesterday' }
]

const uploads = [
  { name: 'Chest X-ray.pdf', size: '842KB' },
  { name: 'CBC Results.pdf', size: '472KB' },
  { name: 'Allergy Note.jpg', size: '213KB' }
]

export default function PatientDashboard() {
  return (
    <PatientLayout>
      <motion.div className="space-y-8 max-w-7xl mx-auto p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-sky-900">Welcome back</h1>
          <p className="text-sm text-gray-500">Here's your personalized command center.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {vitals.map((v, i) => (
            <StatCard key={i} {...v} />
          ))}
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sky-700">
              <Clock className="w-5 h-5" /> Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 text-sm">
              {timeline.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <div className="text-xl">{e.icon}</div>
                  <div>
                    <p className="font-semibold text-slate-800">{e.title}</p>
                    <p className="text-slate-600 text-xs">{e.detail}</p>
                    <p className="text-slate-400 text-xs mt-1">{e.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-700">
              <MessageSquare className="w-5 h-5" /> AI Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {chats.map((entry, i) => (
              <div key={i} className="rounded-lg bg-white/70 p-4 shadow-sm border">
                <p className="font-medium text-gray-800">🧠 {entry.prompt}</p>
                <p className="text-sm text-gray-600 mt-2">💬 {entry.response}</p>
                <p className="text-xs text-gray-400 mt-1">{entry.time}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">Full History</Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <FileText className="w-5 h-5" /> Uploaded Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {uploads.map((f, i) => (
                <li key={i} className="flex justify-between border-b pb-1 border-slate-200">
                  <span>{f.name}</span>
                  <span className="text-slate-500 text-xs">{f.size}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-10">
          <AssistantBar />
        </div>
      </motion.div>
    </PatientLayout>
  )
}