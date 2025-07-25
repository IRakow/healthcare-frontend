import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { useState } from 'react';

const invoices = [
  {
    employer: 'Sunset Wellness',
    period: 'Jul 1 - Jul 31',
    total: '$8,300',
    status: 'Paid',
    pdfLink: '#',
  },
  {
    employer: 'Glow Tech Inc.',
    period: 'Jul 1 - Jul 31',
    total: '$14,200',
    status: 'Pending',
    pdfLink: '#',
  },
  {
    employer: 'Horizon Labs',
    period: 'Jul 1 - Jul 31',
    total: '$18,500',
    status: 'Generated',
    pdfLink: '#',
  },
];

export default function OwnerInvoices() {
  const [tab, setTab] = useState('All');

  const filtered = tab === 'All' ? invoices : invoices.filter(inv => inv.status === tab);

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Invoices</h1>
        <Button onClick={() => alert('AI Summary Coming Soon')}>Summarize with AI</Button>
      </div>

      <Tabs
        tabs={['All', 'Paid', 'Pending', 'Generated']}
        active={tab}
        onSelect={setTab}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filtered.map((invoice, idx) => (
          <Card key={idx} title={invoice.employer}>
            <p className="text-sm text-gray-700 mb-1">Period: {invoice.period}</p>
            <p className="text-sm text-gray-700 mb-1">Amount: <strong>{invoice.total}</strong></p>
            <div className="flex justify-between items-center mt-3">
              <Badge label={invoice.status} color={
                invoice.status === 'Paid' ? 'green' :
                invoice.status === 'Pending' ? 'yellow' : 'blue'
              } />
              <a href={invoice.pdfLink}>
                <Button variant="secondary">Download PDF</Button>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}