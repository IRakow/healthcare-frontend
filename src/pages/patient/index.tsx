// src/pages/patient/index.tsx

import PatientLayout from '@/components/layout/PatientLayout';
import PatientHealthDashboard from '@/components/patient/PatientHealthDashboard';

export default function PatientDashboardIndex() {
  return (
    <PatientLayout>
      <PatientHealthDashboard />
    </PatientLayout>
  );
}