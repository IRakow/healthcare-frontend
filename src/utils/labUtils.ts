import { supabase } from '@/lib/supabaseClient';

interface LabResult {
  name: string;
  value: number | string;
  unit: string;
  reference: string;
}

export async function saveLabResults(
  patientId: string, 
  panel: string, 
  date: string, 
  results: LabResult[]
) {
  try {
    // Save to lab_results table
    const { data: labResult, error: labError } = await supabase
      .from('lab_results')
      .insert({
        patient_id: patientId,
        panel,
        date,
        results
      })
      .select()
      .single();

    if (labError) throw labError;

    // Add to timeline
    await supabase.from('patient_timeline_events').insert({
      patient_id: patientId,
      type: 'lab',
      label: `Lab Panel: ${panel}`,
      data: { results, lab_id: labResult.id, date }
    });

    return { success: true, data: labResult };
  } catch (error) {
    console.error('Error saving lab results:', error);
    return { success: false, error };
  }
}

export async function getLabHistory(patientId: string, panel?: string) {
  const query = supabase
    .from('lab_results')
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: false });

  if (panel) {
    query.eq('panel', panel);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching lab history:', error);
    return [];
  }
  
  return data || [];
}