// File: src/pages/patient/AppointmentsPage.tsx

import React from 'react';
import { AppointmentBooking } from '@/components/patient/AppointmentBooking';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AppointmentsPage() {
  return (
    <Card className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 space-y-4 max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-sky-900 flex items-center gap-2">
          📆 Book an Appointment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AppointmentBooking />
      </CardContent>
    </Card>
  );
}
