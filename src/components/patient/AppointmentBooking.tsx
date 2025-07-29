// File: src/pages/patient/AppointmentBooking.tsx

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CalendarDays, Clock, Pencil } from 'lucide-react';

export const AppointmentBooking = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  const handleBook = () => {
    if (!date || !time || !reason.trim()) {
      toast.error('Please complete all fields to book an appointment.');
      return;
    }

    toast.success(`✅ Appointment booked for ${date} at ${time}.`);
    setDate('');
    setTime('');
    setReason('');
  };

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 max-w-xl mx-auto space-y-5">
      <h2 className="text-2xl font-bold text-sky-800 flex items-center gap-2">
        📅 Book Appointment
      </h2>

      <div className="space-y-3">
        <div className="relative">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pl-10"
          />
          <CalendarDays className="absolute left-3 top-2.5 h-5 w-5 text-sky-500" />
        </div>

        <div className="relative">
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="pl-10"
          />
          <Clock className="absolute left-3 top-2.5 h-5 w-5 text-sky-500" />
        </div>

        <div className="relative">
          <Input
            type="text"
            placeholder="Reason for visit"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="pl-10"
          />
          <Pencil className="absolute left-3 top-2.5 h-5 w-5 text-sky-500" />
        </div>
      </div>

      <Button
        onClick={handleBook}
        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 rounded-xl"
      >
        Book Now
      </Button>
    </Card>
  );
};
