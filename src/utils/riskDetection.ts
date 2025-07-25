import { supabase } from '@/lib/supabaseClient';

interface Vital {
  id: string;
  patient_id: string;
  bp_systolic?: number;
  bp_diastolic?: number;
  temp?: number;
  heart_rate?: number;
  created_at: string;
}

interface RiskCriteria {
  bp_systolic_high: number;
  bp_diastolic_high: number;
  temp_high: number;
  heart_rate_high: number;
  heart_rate_low: number;
}

const DEFAULT_RISK_CRITERIA: RiskCriteria = {
  bp_systolic_high: 160,
  bp_diastolic_high: 100,
  temp_high: 102,
  heart_rate_high: 120,
  heart_rate_low: 40
};

export async function detectHighRiskPatients(criteria: RiskCriteria = DEFAULT_RISK_CRITERIA) {
  const { data: vitals } = await supabase.from('vitals').select('*');
  
  const riskPatients = vitals?.filter(v => 
    (v.bp_systolic && v.bp_systolic > criteria.bp_systolic_high) || 
    (v.bp_diastolic && v.bp_diastolic > criteria.bp_diastolic_high) ||
    (v.temp && v.temp > criteria.temp_high) ||
    (v.heart_rate && v.heart_rate > criteria.heart_rate_high) ||
    (v.heart_rate && v.heart_rate < criteria.heart_rate_low)
  ) || [];

  return riskPatients;
}

export async function createRiskFlags(patientId: string, vital: Vital) {
  const flags = [];

  if (vital.bp_systolic && vital.bp_systolic > 160) {
    const reason = `BP ${vital.bp_systolic}/${vital.bp_diastolic || '??'}`;
    
    flags.push({
      patient_id: patientId,
      label: 'Critical Blood Pressure',
      reason: `Systolic BP ${vital.bp_systolic} mmHg (critical > 160)`
    });
    
    // Add to patient timeline
    await supabase.from('patient_timeline_events').insert({
      patient_id: patientId,
      type: 'alert',
      label: 'Risk Flag Raised',
      data: { reason, flagged_by: 'system', vital_type: 'blood_pressure', value: vital.bp_systolic }
    });
  }

  if (vital.temp && vital.temp > 102) {
    const reason = `Temperature ${vital.temp}°F`;
    
    flags.push({
      patient_id: patientId,
      label: 'High Fever',
      reason: `Temperature ${vital.temp}°F (critical > 102)`
    });
    
    // Add to patient timeline
    await supabase.from('patient_timeline_events').insert({
      patient_id: patientId,
      type: 'alert',
      label: 'Risk Flag Raised',
      data: { reason, flagged_by: 'system', vital_type: 'temperature', value: vital.temp }
    });
  }

  if (flags.length > 0) {
    await supabase.from('patient_risk_flags').insert(flags);
  }

  return flags;
}

export async function checkMedicationCompliance() {
  const { data: meds } = await supabase.from('medications').select('*');
  const missed = meds?.filter((m: any) => m.missed_doses > 3) || [];
  
  for (const med of missed) {
    const reason = `${med.name} - Missed ${med.missed_doses} doses`;
    
    await supabase.from('patient_risk_flags').insert({
      patient_id: med.patient_id,
      label: 'Medication Non-Compliance',
      reason
    });
    
    // Add to patient timeline
    await supabase.from('patient_timeline_events').insert({
      patient_id: med.patient_id,
      type: 'alert',
      label: 'Risk Flag Raised',
      data: { 
        reason: `Missed meds x${med.missed_doses}`, 
        flagged_by: 'system', 
        medication: med.name,
        missed_doses: med.missed_doses 
      }
    });
  }
  
  return missed;
}

export async function checkOverdueAppointments(daysOverdue: number = 90) {
  const { data: appts } = await supabase.from('appointments').select('*');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);
  
  const overdue = appts?.filter((a: any) => 
    new Date(a.date) < cutoffDate && a.status !== 'complete'
  ) || [];
  
  for (const appt of overdue) {
    const daysSince = Math.floor((new Date().getTime() - new Date(appt.date).getTime()) / (1000 * 60 * 60 * 24));
    const reason = `No visit since ${new Date(appt.date).toLocaleDateString()} (${daysSince} days)`;
    
    await supabase.from('patient_risk_flags').insert({
      patient_id: appt.patient_id,
      label: 'Overdue Follow-up',
      reason
    });
    
    // Add to patient timeline
    await supabase.from('patient_timeline_events').insert({
      patient_id: appt.patient_id,
      type: 'alert',
      label: 'Risk Flag Raised',
      data: { 
        reason: `No follow-up in ${daysSince} days`, 
        flagged_by: 'system',
        last_visit_date: appt.date,
        days_overdue: daysSince
      }
    });
  }
  
  return overdue;
}

export async function checkAndFlagRiskPatients() {
  // Check vitals
  const { data: vitals } = await supabase.from('vitals').select('*');
  const riskPatients = vitals?.filter((v: any) => v.bp_systolic > 160 || v.temp > 102) || [];

  for (const vital of riskPatients) {
    await createRiskFlags(vital.patient_id, vital);
  }

    // Check medication compliance
  const missedMeds = await checkMedicationCompliance();
  
  // Check overdue appointments
  const overdueAppts = await checkOverdueAppointments();

  return { riskPatients, missedMeds, overdueAppts };
}

export async function runAIRiskDetection(patientId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-risks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ patientId })
    });

    const { risks } = await response.json();
    return risks;
  } catch (error) {
    console.error('AI risk detection failed:', error);
    return [];
  }
}