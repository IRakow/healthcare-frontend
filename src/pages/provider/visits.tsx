import React from 'react';
import { ProviderVisitSchedule } from '@/components/provider/ProviderVisitSchedule';

export default function ProviderVisitsPage() {
  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Upcoming Visits</h1>
        <ProviderVisitSchedule />
      </div>
    </div>
  );
}