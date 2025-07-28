import { generateSOAPSummary as generateSOAP } from '@/lib/api/generateSOAPSummary';

/**
 * Generates a SOAP note from a transcript
 * This is a wrapper around the API function for backward compatibility
 * @deprecated Use @/lib/api/generateSOAPSummary instead
 */
export async function generateSOAPSummary(transcript: string): Promise<string> {
  try {
    const result = await generateSOAP(transcript);
    
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