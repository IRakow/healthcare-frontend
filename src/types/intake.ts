export interface PatientIntake {
  id?: string;
  patient_id: string;
  conditions: string[];
  surgeries: string[];
  allergies: string[];
  family_history: string[];
  created_at?: string;
  updated_at?: string;
}

export type IntakeFieldType = 'conditions' | 'surgeries' | 'allergies' | 'family_history';