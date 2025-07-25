import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 95000 },
  { month: 'Feb', revenue: 112000 },
  { month: 'Mar', revenue: 132000 },
  { month: 'Apr', revenue: 148000 },
  { month: 'May', revenue: 174000 },
  { month: 'Jun', revenue: 201000 },
  { month: 'Jul', revenue: 212540 },
];

const topEmployers = [
  { name: 'Glow Tech', patients: 412 },
  { name: 'Sunset Wellness', patients: 183 },
  { name: 'Horizon Labs', patients: 109 },
  { name: 'ElevateX', patients: 94 },
  { name: 'BioPulse', patients: 62 },
];

export default function ReportsPage() {
  const [tab, setTab] = useState('Revenue');

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
      </div>

      <Tabs
        tabs={['Revenue', 'Top Employers']}
        active={tab}
        onSelect={setTab}
      />

      {tab === 'Revenue' && (
        <Card title="Monthly Revenue Growth">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {tab === 'Top Employers' && (
        <Card title="Top Employers by Active Patients">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topEmployers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="patients" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}