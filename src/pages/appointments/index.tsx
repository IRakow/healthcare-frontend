// File: src/pages/patient/appointments/index.tsx

import PatientLayout from '@/components/layout/PatientLayout';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';

export default function AppointmentsIndex() {
  const navigate = useNavigate();

  return (
    <PatientLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-sky-800">Appointments</h1>
            <p className="text-gray-600 mt-1">View and manage your past and upcoming appointments</p>
          </div>
          <Button onClick={() => navigate('/patient/appointments/new')}>
            <Plus className="mr-2 h-4 w-4" /> Book Appointment
          </Button>
        </div>

        {/* Placeholder for future calendar or timeline component */}
        <div className="bg-white/70 backdrop-blur rounded-xl shadow p-6 flex items-center justify-center">
          <Calendar className="w-10 h-10 text-sky-500 mr-4" />
          <p className="text-gray-600">Your upcoming and past appointments will appear here soon.</p>
        </div>
      </div>
    </PatientLayout>
  );
}