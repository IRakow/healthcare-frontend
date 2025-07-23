export default function Timeline() {
  const events = [
    { type: 'Visit', desc: 'Virtual visit with Dr. Harper', date: '2025-07-02' },
    { type: 'Lab Result', desc: 'Lipid panel uploaded', date: '2025-07-03' },
    { type: 'Message', desc: 'Secure message sent to provider', date: '2025-07-04' },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📆 Health Timeline</h2>
      <ul className="space-y-4">
        {events.map((e, i) => (
          <li key={i} className="border-l-4 border-blue-500 pl-4">
            <p className="text-sm text-gray-500">{e.date}</p>
            <p className="font-semibold">{e.type}</p>
            <p>{e.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}