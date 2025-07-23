export default function Reports() {
  const reports = [
    { name: 'Blood Test Results.pdf', date: '2025-07-05' },
    { name: 'X-Ray Report.pdf', date: '2025-07-03' }
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🧾 Medical Reports</h2>
      <ul className="list-disc pl-6">
        {reports.map((r, i) => (
          <li key={i}>
            <a href="#" className="text-blue-600 underline">{r.name}</a> — {r.date}
          </li>
        ))}
      </ul>
    </div>
  );
}