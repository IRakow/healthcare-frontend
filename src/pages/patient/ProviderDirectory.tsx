export default function ProviderDirectory() {
  const providers = [
    { name: 'Dr. Lisa Chang', specialty: 'Cardiology', city: 'San Francisco' },
    { name: 'Dr. Robert Kim', specialty: 'Dermatology', city: 'Los Angeles' },
    { name: 'Dr. Priya Desai', specialty: 'Endocrinology', city: 'New York' }
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">👨‍⚕️ Provider Directory</h2>
      <div className="space-y-4">
        {providers.map((p, i) => (
          <div key={i} className="p-4 shadow rounded bg-white">
            <p className="text-lg font-semibold">{p.name}</p>
            <p className="text-gray-600">{p.specialty} - {p.city}</p>
          </div>
        ))}
      </div>
    </div>
  );
}