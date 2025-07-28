import React from 'react';
import { ProviderPatientSearch } from '@/components/provider/ProviderPatientSearch';
import ProviderLayout from '@/components/layout/ProviderLayout';

export default function ProviderPatientsPage() {
  return (
    <ProviderLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
        <ProviderPatientSearch />
      </div>
    </ProviderLayout>
  );
}