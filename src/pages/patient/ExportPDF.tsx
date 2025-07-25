import { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '@/lib/supabase';

export default function ExportPDF() {
  const ref = useRef(null);

  async function generatePDF() {
    const canvas = await html2canvas(ref.current!);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save('insperity-health-record.pdf');

    // Log export to timeline
    const user = supabase.auth.user();
    await supabase.from('patient_timeline_events').insert({
      patient_id: user.id,
      type: 'export',
      label: 'Record Exported (PDF)',
      data: { triggered_by: 'patient', date: new Date().toISOString() }
    });
  }

  useEffect(() => {
    generatePDF();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div ref={ref} className="bg-white text-sm p-6 rounded-xl space-y-4">
        <h1 className="text-xl font-bold text-blue-700">INSPERITY HEALTH REPORT</h1>
        <p className="text-gray-500">Patient ID: [Auto-filled]</p>

        {/* Render sections */}
        <Section label="Medications">
          <ul>
            <li>Metformin — 500mg daily</li>
            <li>Ibuprofen — as needed</li>
          </ul>
        </Section>

        <Section label="Recent Labs">
          <ul>
            <li>Glucose: 92 mg/dL (normal)</li>
            <li>BUN: 24 mg/dL (slightly elevated)</li>
          </ul>
        </Section>

        <Section label="Timeline Highlights">
          <ul>
            <li>03/15 — Video Visit: "SOAP Note Generated"</li>
            <li>03/14 — Lab Result Logged</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-gray-800 mb-1">{label}</h2>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}