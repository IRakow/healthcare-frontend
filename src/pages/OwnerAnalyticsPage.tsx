import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export default function OwnerAnalyticsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.functions.invoke('get-owner-analytics', {
        body: { ownerId: 'demo-owner-id' }, // Replace with real ID from session
      });
      if (!error) setStats(data);
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">📊 Company Analytics</h1>
      <p className="text-gray-600">Monitor usage, health engagement, and AI activity.</p>
      {stats ? (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold">Total Patients</h2>
            <p className="text-2xl font-bold">{stats.total_patients}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold">Avg Appointments/User</h2>
            <p className="text-2xl font-bold">{stats.avg_appointments}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold">Active Wearables</h2>
            <p className="text-2xl font-bold">{stats.device_count}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Loading stats...</p>
      )}
    </div>
  );
}