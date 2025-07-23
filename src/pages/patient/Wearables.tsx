import { useEffect, useState } from 'react';

export default function Wearables() {
  const [data, setData] = useState({ steps: 0, sleep: 0, heartRate: 0 });

  useEffect(() => {
    // Simulate wearable API call
    setTimeout(() => {
      setData({ steps: 7560, sleep: 7.2, heartRate: 72 });
    }, 1000);
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold">📲 Wearables Dashboard</h2>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-white shadow p-4 rounded text-center">
          <p className="text-lg font-semibold">🚶‍♂️ {data.steps}</p>
          <p className="text-gray-500 text-sm">Steps Today</p>
        </div>
        <div className="bg-white shadow p-4 rounded text-center">
          <p className="text-lg font-semibold">😴 {data.sleep}h</p>
          <p className="text-gray-500 text-sm">Sleep</p>
        </div>
        <div className="bg-white shadow p-4 rounded text-center">
          <p className="text-lg font-semibold">❤️ {data.heartRate} bpm</p>
          <p className="text-gray-500 text-sm">Heart Rate</p>
        </div>
      </div>
    </div>
  );
}