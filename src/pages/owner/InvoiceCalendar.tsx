import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

const events = [
  { date: '2025-07-24', type: 'payout', label: 'Horizon Labs – $18,500' },
  { date: '2025-07-20', type: 'invoice', label: 'Glow Tech Invoice – $14,200' },
];

export default function InvoiceCalendar() {
  const [value, setValue] = useState(new Date());

  const dateStr = value.toISOString().split('T')[0];
  const matches = events.filter(e => e.date === dateStr);

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Financial Calendar</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Calendar onChange={setValue} value={value} />
        <Card title={`Events on ${dateStr}`}>
          {matches.length > 0 ? (
            matches.map((e, i) => (
              <div key={i} className="mb-2">
                <p className="text-sm text-gray-700">{e.type === 'invoice' ? '🧾' : '💸'} {e.label}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No financial events</p>
          )}
        </Card>
      </div>
    </div>
  );
}