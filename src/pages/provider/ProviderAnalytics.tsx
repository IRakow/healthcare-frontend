import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

interface RiskFlag {
  id: string;
  patient_id: string;
  label: string;
  reason: string;
  patient?: { name: string };
}

export default function ProviderAnalytics() {
  const [stats, setStats] = useState({
    appointments: 0,
    completed: 0,
    aiUsed: 0,
    overdue: 0,
  });
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>([]);

  useEffect(() => {
    (async () => {
      const user = supabase.auth.user();

      const { count: apptCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', user.id);

      const { count: complete } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', user.id)
        .eq('status', 'complete');

      const { count: aiLogs } = await supabase
        .from('ai_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: overdue } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', user.id)
        .eq('status', 'pending');

      setStats({
        appointments: apptCount || 0,
        completed: complete || 0,
        aiUsed: aiLogs || 0,
        overdue: overdue || 0,
      });

      // Check for high-risk patients based on vitals
      const { data: vitals } = await supabase.from('vitals').select('*');
      const riskPatients = vitals?.filter(v => v.bp_systolic > 160 || v.temp > 102) || [];
      
      // Check for medication non-compliance
      const { data: meds } = await supabase.from('medications').select('*');
      const missed = meds?.filter((m: any) => m.missed_doses > 3) || [];
      
      // Check for overdue appointments
      const { data: appts } = await supabase.from('appointments').select('*');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago
      const overdueAppts = appts?.filter((a: any) => 
        new Date(a.date) < cutoffDate && a.status !== 'complete'
      ) || [];
      
      // Create risk flags based on real data
      const flags = [];
      
      // Add vital-based risk flags
      riskPatients.forEach((vital: any, index: number) => {
        if (vital.bp_systolic > 160) {
          flags.push({
            id: `vital-${index}`,
            patient_id: vital.patient_id,
            label: 'Abnormal blood pressure',
            reason: `BP ${vital.bp_systolic}/${vital.bp_diastolic || '??'}`,
            patient: { name: 'Emily Turner' } // Mock name for now
          });
        }
        if (vital.temp > 102) {
          flags.push({
            id: `temp-${index}`,
            patient_id: vital.patient_id,
            label: 'High fever',
            reason: `Temperature ${vital.temp}°F`,
            patient: { name: 'Patient ' + (index + 1) }
          });
        }
      });
      
      // Add medication non-compliance flags
      missed.forEach((med: any, index: number) => {
        flags.push({
          id: `med-${index}`,
          patient_id: med.patient_id,
          label: `Missed meds x${med.missed_doses}`,
          reason: `${med.name} - Non-compliance`,
          patient: { name: 'Leo Chavez' } // Mock name for now
        });
      });
      
      // Add overdue appointment flags
      overdueAppts.forEach((appt: any, index: number) => {
        const daysSince = Math.floor((new Date().getTime() - new Date(appt.date).getTime()) / (1000 * 60 * 60 * 24));
        flags.push({
          id: `overdue-${index}`,
          patient_id: appt.patient_id,
          label: `No follow-up in ${daysSince} days`,
          reason: `Last visit: ${new Date(appt.date).toLocaleDateString()}`,
          patient: { name: 'Sophia Lane' } // Mock name for now
        });
      });
      
      setRiskFlags(flags.slice(0, 3)); // Show top 3 risk flags
    })();
  }, []);

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">📈 My Clinical Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white/80 backdrop-blur p-6 shadow-xl hover:shadow-2xl transition-all">
          <h3 className="text-lg font-semibold mb-2">Total Appointments</h3>
          <p className="text-2xl font-semibold">{stats.appointments}</p>
        </div>

        <div className="rounded-2xl border bg-white/80 backdrop-blur p-6 shadow-xl hover:shadow-2xl transition-all">
          <h3 className="text-lg font-semibold mb-2">Completed Visits</h3>
          <p className="text-2xl font-semibold">{stats.completed}</p>
        </div>

        <div className="rounded-2xl border bg-white/80 backdrop-blur p-6 shadow-xl hover:shadow-2xl transition-all">
          <h3 className="text-lg font-semibold mb-2">AI SOAP Notes Created</h3>
          <p className="text-2xl font-semibold">{stats.aiUsed}</p>
        </div>

        <div className="rounded-2xl border bg-white/80 backdrop-blur p-6 shadow-xl hover:shadow-2xl transition-all">
          <h3 className="text-lg font-semibold mb-2">Overdue Visits</h3>
          <p className="text-2xl font-semibold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      <Card title="⚠️ Patient Risk Flags">
        {riskFlags.length === 0 ? (
          <p className="text-sm text-gray-500">No active risk flags</p>
        ) : (
          <ul className="text-sm space-y-2">
            {riskFlags.map((flag) => (
              <li key={flag.id} className="flex justify-between">
                <span>{flag.patient?.name || 'Unknown Patient'}</span>
                <span className={
                  flag.label.includes('blood pressure') ? 'text-red-600' :
                  flag.label.includes('meds') ? 'text-orange-500' :
                  'text-yellow-600'
                }>{flag.label}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}