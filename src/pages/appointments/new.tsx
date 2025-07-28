// File: src/pages/patient/appointments/new.tsx

import PatientLayout from '@/components/layout/PatientLayout';
import AppointmentBooking from '@/components/patient/AppointmentBooking';

export default function NewAppointmentPage() {
  return (
    <PatientLayout>
      <div className="p-6 max-w-xl mx-auto">
        <AppointmentBooking />
      </div>
    </PatientLayout>
  );
}