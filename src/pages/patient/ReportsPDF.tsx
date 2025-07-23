export default function ReportsPDF() {
  const reports = [
    { name: 'Cardiology Report', url: '/reports/cardiology.pdf' },
    { name: 'MRI Scan Summary', url: '/reports/mri-scan.pdf' }
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📄 View Medical Reports</h2>
      <ul className="list-disc pl-6">
        {reports.map((r, i) => (
          <li key={i}>
            <a href={r.url} className="text-blue-600 underline" target="_blank">{r.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}