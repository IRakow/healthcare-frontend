export interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  date: string;
  time: string;
  type: 'telemed' | 'in-person';
  reason: string;
  status: 'pending' | 'in_progress' | 'complete' | 'cancelled' | 'confirmed' | 'completed';
  video_url?: string;
  created_at: string;
  provider?: Provider;
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  avatar_url?: string;
}

export const APPOINTMENT_TYPES = [
  { value: 'telemed', label: 'Telemedicine', icon: '💻' },
  { value: 'in-person', label: 'In-Person', icon: '🏥' }
] as const;

export const APPOINTMENT_TIMES = [
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM'
];

export const APPOINTMENT_REASONS = [
  'Annual Check-up',
  'Follow-up Visit',
  'New Patient Visit',
  'Sick Visit',
  'Prescription Refill',
  'Lab Results Review',
  'Consultation',
  'Vaccination',
  'Other'
];