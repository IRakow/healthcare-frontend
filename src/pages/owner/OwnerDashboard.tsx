import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { useState } from 'react';

const kpis = [
  { label: 'Total Employers', value: 34 },
  { label: 'Active Patients', value: 1284 },
  { label: 'Monthly Revenue', value: '$212,540' },
  { label: 'Upcoming Payouts', value: '$41,000' },
];

const payouts = [
  { company: 'Sunset Wellness', amount: '$8,300', date: 'Jul 20', status: 'Scheduled' },
  { company: 'Glow Tech Inc.', amount: '$14,200', date: 'Jul 23', status: 'Processing' },
  { company: 'Horizon Labs', amount: '$18,500', date: 'Jul 24', status: 'Scheduled' },
];

const appointments = [
  { name: 'Emily Turner', provider: 'Dr. Rivas', date: 'Jul 25', time: '2:00 PM' },
  { name: 'Leo Chavez', provider: 'NP McKinley', date: 'Jul 25', time: '4:00 PM' },
];

export default function OwnerDashboard() {
  const [tab, setTab] = useState('Overview');

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Owner Dashboard</h1>
        <Button variant="primary" onClick={() => alert('AI Assistant Coming Soon!')}>Open AI Assistant</Button>
      </div>

      <Tabs
        tabs={['Overview', 'Appointments', 'Payouts']}
        active={tab}
        onSelect={setTab}
      />

      {tab === 'Overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {kpis.map(kpi => (
            <Card key={kpi.label} title={kpi.label}>
              <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
            </Card>
          ))}
        </div>
      )}

      {tab === 'Appointments' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {appointments.map((appt, idx) => (
            <Card key={idx} title={`${appt.name} — ${appt.date}`}>
              <p className="text-sm text-gray-700">Time: {appt.time}</p>
              <p className="text-sm text-gray-700">Provider: {appt.provider}</p>
              <div className="mt-3">
                <Button variant="secondary">View Record</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'Payouts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {payouts.map((pay, idx) => (
            <Card key={idx} title={pay.company}>
              <p className="text-sm text-gray-700">Amount: <strong>{pay.amount}</strong></p>
              <p className="text-sm text-gray-700">Date: {pay.date}</p>
              <div className="mt-2">
                <Badge label={pay.status} color={pay.status === 'Processing' ? 'yellow' : 'green'} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-10">
        <Card title="Monthly Revenue Progress">
          <Progress value={71} />
          <p className="text-xs text-gray-500 mt-2">71% of goal reached for July</p>
        </Card>
      </div>
    </div>
  );
}