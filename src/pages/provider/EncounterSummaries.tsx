export default function EncounterSummaries() {
  const summaries = [
    {
      id: '1',
      patient: 'Ethan Wright',
      subjective: 'Mild sore throat and fatigue.',
      objective: 'Low-grade fever, red pharynx.',
      assessment: 'Likely viral pharyngitis.',
      plan: 'Fluids, rest, recheck in 3 days.'
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🩺 Encounter Summaries</h2>
      {summaries.map((s) => (
        <div key={s.id} className="bg-white shadow rounded p-4 mb-4">
          <p className="text-lg font-semibold">Patient: {s.patient}</p>
          <p><strong>Subjective:</strong> {s.subjective}</p>
          <p><strong>Objective:</strong> {s.objective}</p>
          <p><strong>Assessment:</strong> {s.assessment}</p>
          <p><strong>Plan:</strong> {s.plan}</p>
        </div>
      ))}
    </div>
  );
}