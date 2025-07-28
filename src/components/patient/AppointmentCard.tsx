// File: src/components/patient/AppointmentCard.tsx

import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface Appointment {
  id: string;
  date: string;
  provider_name: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface AppointmentCardProps {
  appointment: Appointment;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const formattedDate = format(new Date(appointment.date), 'PPpp');
  const statusColor = {
    scheduled: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700'
  }[appointment.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 bg-white/80 backdrop-blur rounded-2xl shadow border border-gray-200 mb-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {appointment.provider_name} — {appointment.reason}
        </h3>
        <Badge className={statusColor}>{appointment.status}</Badge>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
    </motion.div>
  );
};