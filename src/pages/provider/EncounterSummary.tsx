export default function EncounterSummary() {
  const summary = {
    patient: 'Emma Williams',
    subjective: 'Throat discomfort and headache.',
    objective: 'Low-grade fever, swollen lymph nodes.',
    assessment: 'Viral pharyngitis suspected.',
    plan: 'Hydration, rest, OTC meds, follow-up in 5 days.'
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🩺 Encounter Summary</h2>
      <div className="bg-white rounded shadow p-4">
        <p><strong>Patient:</strong> {summary.patient}</p>
        <p><strong>Subjective:</strong> {summary.subjective}</p>
        <p><strong>Objective:</strong> {summary.objective}</p>
        <p><strong>Assessment:</strong> {summary.assessment}</p>
        <p><strong>Plan:</strong> {summary.plan}</p>
      </div>
    </div>
  );
}