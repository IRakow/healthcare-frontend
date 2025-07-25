import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const employers = [
  {
    name: 'Sunset Wellness',
    logo: '/logos/sunset.png',
    activeUsers: 183,
    plan: 'Gold',
    status: 'Active',
    primaryColor: '#f97316',
  },
  {
    name: 'Glow Tech Inc.',
    logo: '/logos/glowtech.png',
    activeUsers: 412,
    plan: 'Platinum',
    status: 'Pending',
    primaryColor: '#3b82f6',
  },
  {
    name: 'Horizon Labs',
    logo: '/logos/horizon.png',
    activeUsers: 109,
    plan: 'Silver',
    status: 'Suspended',
    primaryColor: '#10b981',
  },
];

export default function EmployersPage() {
  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employers</h1>
        <Button onClick={() => alert('AI Tools Coming Soon')}>AI Summarize</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {employers.map((employer, idx) => (
          <Card key={idx} title={employer.name}>
            <div className="flex items-center gap-3 mb-2">
              <img src={employer.logo} alt="Logo" className="w-10 h-10 rounded-full object-cover border" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-700">Users: {employer.activeUsers}</span>
                <span className="text-sm text-gray-700">Plan: {employer.plan}</span>
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <Badge
                label={employer.status}
                color={
                  employer.status === 'Active' ? 'green' :
                  employer.status === 'Pending' ? 'yellow' : 'red'
                }
              />
              <Button variant="secondary" onClick={() => alert(`Previewing ${employer.name} brand`)}>
                Preview Brand
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}