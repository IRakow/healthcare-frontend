import React from 'react';
import { ProviderVisitSchedule } from '@/components/provider/ProviderVisitSchedule';
import ProviderLayout from '@/components/layout/ProviderLayout';

export default function ProviderVisitsPage() {
  return (
    <ProviderLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Upcoming Visits</h1>
        <ProviderVisitSchedule />
      </div>
    </ProviderLayout>
  );
}