import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const payoutData = [
  { company: 'Glow Tech Inc.', amount: '$14,200', status: 'Processing', date: '2025-07-20' },
  { company: 'Sunset Wellness', amount: '$8,300', status: 'Paid', date: '2025-07-19' },
  { company: 'Horizon Labs', amount: '$18,500', status: 'Scheduled', date: '2025-07-25' },
  { company: 'BioPulse', amount: '$6,000', status: 'Paid', date: '2025-07-18' },
  { company: 'ElevateX', amount: '$10,750', status: 'Processing', date: '2025-07-21' },
];

export default function PayoutsPage() {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? payoutData : payoutData.filter((p) => p.status === filter);

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Payouts</h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => alert('CSV Export Coming Soon')}>Export CSV</Button>
          <Button variant="secondary" onClick={() => alert('PDF Download Coming Soon')}>Download PDF</Button>
        </div>
      </div>

      <div className="mb-6">
        <Select
          label="Filter by Status"
          value={filter}
          onChange={(e: any) => setFilter(e.target.value)}
          options={[
            { label: 'All', value: 'All' },
            { label: 'Scheduled', value: 'Scheduled' },
            { label: 'Processing', value: 'Processing' },
            { label: 'Paid', value: 'Paid' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((payout, idx) => (
          <Card key={idx} title={payout.company}>
            <p className="text-sm text-gray-700 mb-1">Amount: <strong>{payout.amount}</strong></p>
            <p className="text-sm text-gray-700 mb-1">Date: {payout.date}</p>
            <div className="mt-2">
              <Badge
                label={payout.status}
                color={
                  payout.status === 'Paid' ? 'green' :
                  payout.status === 'Processing' ? 'yellow' : 'blue'
                }
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}