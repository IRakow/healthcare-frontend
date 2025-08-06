// src/pages/patient/appointments.tsx

import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { speak } from '@/lib/voice/RachelTTSQueue';

export default function AppointmentForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');
  const source = searchParams.get('source');
  const [appointmentReason, setAppointmentReason] = useState('');

  useEffect(() => {
    if (reason) setAppointmentReason(String(reason));
  }, [reason]);

  async function handleConfirm() {
    const phone = localStorage.getItem('user_phone');
    const appointmentTime = new Date();
    const _event = {
      type: 'appointment',
      title: 'AI Scheduled Appointment',
      details: `Booked via Rachel: ${appointmentReason}`,
      timestamp: appointmentTime.toISOString()
    };

    
    // optional: open calendar event link
    const calendarURL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Doctor+Appointment+-+${encodeURIComponent(appointmentReason)}&dates=${appointmentTime.toISOString().replace(/[-:]/g, '').slice(0, 15)}/${appointmentTime.toISOString().replace(/[-:]/g, '').slice(0, 15)}&details=Scheduled+via+Rachel&location=Virtual&sf=true&output=xml`;
    window.open(calendarURL, '_blank');
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
    if (phone) {
      await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phone,
          message: `Your appointment with a provider from Purity Health has been booked. You'll get a reminder 30 minutes before.`
        })
      });

      // Schedule reminder 30 minutes before
      const reminderTime = new Date(appointmentTime.getTime() - 30 * 60 * 1000);
      await fetch('/api/notifications/schedule-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phone,
          message: `⏰ Reminder: You have an appointment with Purity Health in 30 minutes.`,
          sendAt: reminderTime.toISOString()
        })
      });
    } else {
      const addNumber = confirm('Appointment booked, but no phone number found. Would you like to add your number now to receive SMS reminders?');
      if (addNumber) {
        const newPhone = prompt('Enter your mobile number:');
        if (newPhone) {
          await fetch('/api/health/profile/update-phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: newPhone })
          });
          localStorage.setItem('user_phone', newPhone);
          await fetch('/api/notifications/sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: newPhone,
              message: `Your appointment with a provider from Purity Health has been booked. Check your calendar.`
            })
          });
          alert("Phone saved. You'll now receive SMS reminders.");
        }
      }
    }
    
    alert(`Appointment booked: ${appointmentReason}`);
    speak(`Your appointment has been confirmed. We'll notify you 30 minutes before it begins.`);
    navigate('/patient/confirmation');
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