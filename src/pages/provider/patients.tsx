import React from 'react';
import { ProviderPatientSearch } from '@/components/provider/ProviderPatientSearch';

export default function ProviderPatientsPage() {
  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
        <ProviderPatientSearch />
      </div>
    </div>
  );
}