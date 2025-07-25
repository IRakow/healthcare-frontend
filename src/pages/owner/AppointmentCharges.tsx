import { Card } from '@/components/ui/card';

const appointments = [
  {
    name: 'Leo Chavez',
    date: '2025-07-21',
    provider: 'NP McKinley',
    type: 'Telemed',
    charge: 140,
    employer: 'Glow Tech',
  },
  {
    name: 'Emily Turner',
    date: '2025-07-22',
    provider: 'Dr. Rivas',
    type: 'Follow-up',
    charge: 120,
    employer: 'Glow Tech',
  },
];

export default function AppointmentCharges() {
  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Appointment Billing</h1>
      <Card title="July 2025 – Glow Tech">
        <ul className="text-sm space-y-2">
          {appointments.map((a, i) => (
            <li key={i} className="flex justify-between items-center border-b pb-2">
              <span>{a.date} – {a.name} ({a.type}) w/ {a.provider}</span>
              <span className="font-medium">${a.charge}</span>
            </li>
          ))}
        </ul>
        <p className="text-right mt-4 font-semibold text-gray-800">Total: $260</p>
      </Card>
    </div>
  );
}