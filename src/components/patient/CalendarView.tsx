// File: src/components/patient/CalendarView.tsx

import React, { useEffect, useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { motion } from 'framer-motion';

interface CalendarViewProps {
  patientId: string;
}

const localizer = momentLocalizer(moment);

export const CalendarView: React.FC<CalendarViewProps> = ({ patientId }) => {
  const supabase = useSupabaseClient();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, date, reason')
        .eq('patient_id', patientId);

      if (error) {
        console.error('[CalendarView] Supabase error:', error);
        return;
      }

      const mapped = data.map((appt: any) => ({
        id: appt.id,
        title: appt.reason,
        start: new Date(appt.date),
        end: new Date(appt.date),
        allDay: false
      }));

      setEvents(mapped);
    };

    fetchCalendarEvents();
  }, [patientId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-4 shadow"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Calendar</h3>
      <div className="h-[500px]">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', backgroundColor: 'white', borderRadius: '1rem' }}
        />
      </div>
    </motion.div>
  );
};