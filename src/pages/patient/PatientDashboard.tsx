// File: src/pages/patient/PatientDashboard.tsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PatientLayoutSimple from '@/components/layout/PatientLayoutSimple';
import StatCard from '@/components/ui/StatCard';
import AssistantBar from '@/components/assistant/AssistantBar';
import { Stethoscope, Calendar, Bot, Moon, Apple, Droplets, Footprints, Clock, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PatientDashboard() {
  const [stats, setStats] = useState({
    heartRate: '72 bpm',
    sleep: '7.5 hrs',
    protein: '65g',
    hydration: '64 oz',
    steps: '8,432',
    aiLogs: '3'
  });

  const [timeline, setTimeline] = useState([
    {
      id: '1',
      icon: '💬',
      title: 'Chat with AI Assistant',
      timestamp: '10:15 AM',
      detail: 'Discussed fatigue and protein intake.'
    },
    {
      id: '2',
      icon: '📄',
      title: 'Uploaded Lab Results',
      timestamp: 'Yesterday',
      detail: 'CBC results from Quest Diagnostics.'
    },
    {
      id: '3',
      icon: '💊',
      title: 'Refilled Prescription',
      timestamp: 'Mon, July 28',
      detail: 'Refilled Lisinopril 10mg.'
    }
  ]);

  const [aiConversations, setAIConversations] = useState([
    {
      id: '1',
      prompt: 'What are good ways to improve sleep?',
      response: 'Improving sleep hygiene includes consistent sleep times, no screens before bed, and reducing caffeine.',
      timestamp: 'Today, 9:00 AM'
    },
    {
      id: '2',
      prompt: 'Explain my lab results (CBC)',
      response: 'Your white blood cell count is within normal range. Hemoglobin is slightly low, which could indicate anemia.',
      timestamp: 'Yesterday'
    }
  ]);

  useEffect(() => {
    // Later: fetch patient dashboard data from Supabase
  }, []);

  return (
    <PatientLayoutSimple>
      <AssistantBar role="patient" />

      <motion.div
        className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-sky-900">Welcome back</h1>
          <p className="text-gray-500 text-sm">Your personalized health summary</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <StatCard label="Heart Rate" value={stats.heartRate} icon={<Stethoscope className="w-4 h-4" />} description="Resting" />
          <StatCard label="Sleep" value={stats.sleep} icon={<Moon className="w-4 h-4" />} description="Last Night" />
          <StatCard label="Protein" value={stats.protein} icon={<Apple className="w-4 h-4" />} description="Today" />
          <StatCard label="Hydration" value={stats.hydration} icon={<Droplets className="w-4 h-4" />} description="Goal: 80oz" />
          <StatCard label="Steps" value={stats.steps} icon={<Footprints className="w-4 h-4" />} description="So far" />
          <StatCard label="AI Logs" value={stats.aiLogs} icon={<Bot className="w-4 h-4" />} description="Today" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                📅 Annual Checkup - Dec 15, 2:00 PM<br />
                Dr. Smith - Primary Care
              </li>
              <li>
                🧪 Lab Work - Dec 20, 9:00 AM<br />
                Quest Diagnostics
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-700" />
              Recent Activity Timeline
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-600" />
              AI Assistant Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiConversations.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 bg-white/80">
                <p className="text-sm font-medium text-gray-800">🧠 {entry.prompt}</p>
                <p className="text-sm text-gray-600 mt-2">💬 {entry.response}</p>
                <p className="text-xs text-gray-400 mt-1">{entry.timestamp}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">Open Full History</Button>
          </CardContent>
        </Card>
      </motion.div>
    </PatientLayoutSimple>
  );
}