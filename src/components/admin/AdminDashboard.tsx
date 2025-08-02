import { useEffect, useState } from 'react';
import AssistantBar from '@/components/ai/AssistantBar';
import StatCard from '@/components/ui/StatCard';
import { getAdminStats } from '@/lib/dataService';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    (async () => {
      const res = await getAdminStats();
      setStats(res);
    })();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-4 py-6 sm:px-6 md:px-8">
      <div className="text-2xl font-bold text-blue-900 mb-4">Admin Dashboard</div>
      <div className="flex flex-wrap gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Active Sessions" value={stats.activeSessions} />
        <StatCard title="System Uptime" value={stats.uptime} />
        <StatCard title="AI Requests Today" value={stats.aiRequests} />
      </div>

      <div className="mt-8 w-full">
        <AssistantBar />
      </div>
    </div>
  );
}