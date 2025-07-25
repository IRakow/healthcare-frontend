import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '@/components/ui/card';

const data = [
  { employer: 'Glow Tech', total: 15920 },
  { employer: 'Sunset Wellness', total: 5490 },
  { employer: 'ElevateX', total: 10750 },
];

export default function SpendingTrends() {
  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Employer Spend Comparison</h1>
      <Card>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="employer" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}