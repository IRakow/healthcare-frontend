import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, User } from 'lucide-react';

interface BookingForm {
  provider: string;
  reason: string;
  date: string;
  time: string;
}

export const BookingInterface: React.FC = () => {
  const [form, setForm] = useState<BookingForm>({
    provider: '',
    reason: '',
    date: '',
    time: ''
  });

  const update = (key: keyof BookingForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = () => {
    // TODO: Save appointment to Supabase
    console.log('Booking appointment:', form);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-5"
    >
      <h3 className="text-xl font-semibold text-gray-800">Book a New Appointment</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          placeholder="Provider name (e.g. Dr. Taylor)"
          value={form.provider}
          onChange={(e) => update('provider', e.target.value)}
          icon={User}
        />
        <Input
          placeholder="Reason for visit"
          value={form.reason}
          onChange={(e) => update('reason', e.target.value)}
        />
        <Input
          type="date"
          value={form.date}
          onChange={(e) => update('date', e.target.value)}
          icon={Calendar}
        />
        <Input
          type="time"
          value={form.time}
          onChange={(e) => update('time', e.target.value)}
        />
      </div>

      <Button onClick={handleSubmit}>Submit Booking</Button>
    </motion.div>
  );
};