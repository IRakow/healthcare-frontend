export default function EmployerAnalytics() {
  const stats = {
    totalEmployees: 87,
    activeUsers: 72,
    avgSleepHours: 6.7,
    flagged: 5
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📊 Employer Analytics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Enrolled Employees</p>
          <p className="text-2xl font-semibold text-blue-600">{stats.totalEmployees}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Active Users This Month</p>
          <p className="text-2xl font-semibold text-green-600">{stats.activeUsers}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Avg Sleep (hrs)</p>
          <p className="text-2xl font-semibold text-purple-600">{stats.avgSleepHours}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">At-Risk Flags</p>
          <p className="text-2xl font-semibold text-red-600">{stats.flagged}</p>
        </div>
      </div>
    </div>
  );
}