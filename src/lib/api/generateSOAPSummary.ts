import { supabase } from '@/lib/supabase';

export interface SOAPNote {
  id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd10_codes: string[];
  cpt_codes: string[];
  appointment_id?: string;
  provider_id?: string;
  patient_id?: string;
  created_at: string;
}

export interface SOAPSummary {
  soapNote: SOAPNote;
  summary: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    codes: {
      icd10: string[];
      cpt: string[];
    };
  };
}

export async function generateSOAPSummary(
  transcript: string,
  appointmentId?: string,
  providerId?: string,
  patientId?: string
): Promise<SOAPSummary> {
  const { data, error } = await supabase.functions.invoke('generate-soap-note', {
    body: { 
      transcript,
      appointmentId,
      providerId,
      patientId
    }
  });

  if (error) {
    console.error('[generateSOAPSummary] Error:', error);
    throw new Error('Failed to generate SOAP note');
  }

  return data as SOAPSummary;
}

// Legacy function for backward compatibility
export async function generateSOAPNote(transcript: string): Promise<string> {
  try {
    const result = await generateSOAPSummary(transcript);
    
    // Format as traditional SOAP note text
    return `SOAP Note
=========

S: ${result.summary.subjective}

O: ${result.summary.objective}

A: ${result.summary.assessment}

P: ${result.summary.plan}

ICD-10 Codes: ${result.summary.codes.icd10.join(', ')}
CPT Codes: ${result.summary.codes.cpt.join(', ')}`;
  } catch (error) {
    console.error('Failed to generate SOAP note:', error);
    return 'Unable to generate SOAP note.';
  }
}