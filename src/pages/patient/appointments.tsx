// src/pages/patient/appointments.tsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AppointmentForm() {
  const router = useRouter();
  const { reason, source } = router.query;
  const [appointmentReason, setAppointmentReason] = useState('');

  useEffect(() => {
    if (reason) setAppointmentReason(String(reason));
  }, [reason]);

  async function handleConfirm() {
    await fetch('/api/timeline/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'appointment',
        title: 'AI Scheduled Appointment',
        details: `Booked via Rachel: ${appointmentReason}`,
        timestamp: new Date().toISOString()
      })
    });
    alert(`Appointment booked: ${appointmentReason}`);
    router.push('/patient/confirmation');
  }

  return (
    <div className="min-h-screen px-6 py-20 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center text-indigo-800 mb-4"
      >
        📅 Book Appointment
      </motion.h1>

      {source === 'rachel' && (
        <p className="text-center text-blue-600 mb-6 text-sm">
          Rachel detected you may need care — let's schedule it.
        </p>
      )}

      <div className="max-w-md mx-auto space-y-4">
        <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
        <Input
          value={appointmentReason}
          onChange={(e) => setAppointmentReason(e.target.value)}
          placeholder="e.g., Headache, Chest discomfort, Sleep issues"
        />

        <Button onClick={handleConfirm} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
          Confirm Appointment
        </Button>
      </div>
    </div>
  );
}