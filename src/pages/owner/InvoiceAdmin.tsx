import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Select from '@/components/ui/select';

const invoices = [
  {
    employer: 'Glow Tech Inc.',
    month: '2025-07',
    amount: '$14,200',
    status: 'Paid',
    pdf: 'https://.../glow-2025-07.pdf',
  },
  {
    employer: 'Sunset Wellness',
    month: '2025-07',
    amount: '$8,300',
    status: 'Pending',
    pdf: 'https://.../sunset-2025-07.pdf',
  },
];

export default function InvoiceAdmin() {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? invoices : invoices.filter((inv) => inv.status === filter);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">All Employer Invoices</h1>

      <div className="flex justify-between items-center mb-4">
        <Select
          label="Filter by Status"
          value={filter}
          onChange={(e: any) => setFilter(e.target.value)}
          options={[
            { label: 'All', value: 'All' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Paid', value: 'Paid' },
            { label: 'Processing', value: 'Processing' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((inv, idx) => (
          <Card key={idx} title={`${inv.employer} – ${inv.month}`}>
            <p className="text-sm">Amount: {inv.amount}</p>
            <div className="flex justify-between mt-3">
              <Badge label={inv.status} color={inv.status === 'Paid' ? 'green' : 'yellow'} />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => window.open(inv.pdf)}>PDF</Button>
                <Button onClick={() => alert('Mark as Paid')}>Mark Paid</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}