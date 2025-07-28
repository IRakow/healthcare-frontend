// File: src/components/patient/AppointmentBooking.tsx

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AppointmentBooking() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  const handleBook = () => {
    alert(`Appointment booked for ${date} at ${time}. Reason: ${reason}`);
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur rounded-2xl shadow-xl space-y-4">
      <h2 className="text-2xl font-bold text-sky-800">📅 Book Appointment</h2>

      <div className="space-y-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
        <input
          type="text"
          placeholder="Reason for visit"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white" onClick={handleBook}>
        Book Now
      </Button>
    </Card>
  );
}
