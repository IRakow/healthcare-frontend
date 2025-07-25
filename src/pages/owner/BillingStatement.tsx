import { Card } from '@/components/ui/card';

const statements = [
  {
    company: 'Glow Tech',
    period: 'Jul 2025',
    items: [
      { label: 'Active Members (412 × $35)', amount: '$14,420' },
      { label: 'Appointment Fees (12 visits)', amount: '$1,200' },
      { label: 'Voice AI Add-on', amount: '$300' },
    ],
    total: '$15,920',
  },
  {
    company: 'Sunset Wellness',
    period: 'Jul 2025',
    items: [
      { label: 'Active Members (183 × $30)', amount: '$5,490' },
    ],
    total: '$5,490',
  },
];

export default function BillingStatement() {
  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Billing Statements</h1>
      <div className="space-y-6">
        {statements.map((entry, idx) => (
          <Card key={idx} title={`${entry.company} – ${entry.period}`}>
            <ul className="text-sm text-gray-700 space-y-1 mb-2">
              {entry.items.map((i, ii) => (
                <li key={ii} className="flex justify-between">
                  <span>{i.label}</span>
                  <span>{i.amount}</span>
                </li>
              ))}
            </ul>
            <p className="text-right text-md font-semibold text-gray-800">Total: {entry.total}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}