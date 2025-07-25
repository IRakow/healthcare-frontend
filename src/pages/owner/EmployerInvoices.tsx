import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const invoiceMap = [
  {
    employer: 'Glow Tech Inc.',
    invoices: [
      { date: 'Jul 2025', amount: '$14,200', status: 'Paid' },
      { date: 'Jun 2025', amount: '$13,800', status: 'Paid' },
      { date: 'May 2025', amount: '$12,500', status: 'Paid' },
    ],
  },
  {
    employer: 'Sunset Wellness',
    invoices: [
      { date: 'Jul 2025', amount: '$8,300', status: 'Paid' },
      { date: 'Jun 2025', amount: '$7,900', status: 'Paid' },
    ],
  },
  {
    employer: 'Horizon Labs',
    invoices: [
      { date: 'Jul 2025', amount: '$18,500', status: 'Processing' },
      { date: 'Jun 2025', amount: '$18,300', status: 'Paid' },
    ],
  },
];

export default function EmployerInvoicesPage() {
  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Employer Invoice Summaries</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {invoiceMap.map((block, idx) => (
          <Card key={idx} title={block.employer}>
            <div className="space-y-4">
              {block.invoices.map((inv, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700">{inv.date}</p>
                    <p className="text-sm text-gray-600">Amount: {inv.amount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      label={inv.status}
                      color={
                        inv.status === 'Paid' ? 'green' :
                        inv.status === 'Processing' ? 'yellow' : 'gray'
                      }
                    />
                    <Button variant="secondary" onClick={() => alert('Download PDF')}>
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}