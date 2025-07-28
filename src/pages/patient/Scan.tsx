import React from 'react';
import PatientLayout from '@/components/layout/PatientLayout';
import { ScanNutritionLabel } from '@/components/patient/ScanNutritionLabel';

export default function Scan() {
  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto">
        <ScanNutritionLabel />
      </div>
    </PatientLayout>
  );
}