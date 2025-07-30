-- Insert roles
INSERT INTO roles (name) VALUES 
  ('owner'), 
  ('admin'), 
  ('provider'),
  ('patient')
ON CONFLICT DO NOTHING;

-- Insert demo employer
INSERT INTO employers (id, name, subdomain, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000100',
  'Demo Employer',
  'demo',
  true
) ON CONFLICT DO NOTHING;

-- Insert users (owner, provider, patient)
INSERT INTO users (id, full_name, email, role, employer_id)
VALUES 
  ('00000000-0000-0000-0000-000000000101', 'Ian Owner', 'ian@demo.com', 'owner', '00000000-0000-0000-0000-000000000100'),
  ('00000000-0000-0000-0000-000000000102', 'Dr. Smith', 'provider@demo.com', 'provider', '00000000-0000-0000-0000-000000000100'),
  ('00000000-0000-0000-0000-000000000103', 'John Patient', 'patient@demo.com', 'patient', '00000000-0000-0000-0000-000000000100')
ON CONFLICT DO NOTHING;

-- Insert employer-patient link
INSERT INTO employer_patients (employer_id, patient_id, employee_id, start_date)
VALUES (
  '00000000-0000-0000-0000-000000000100',
  '00000000-0000-0000-0000-000000000103',
  'EMP123',
  CURRENT_DATE
)
ON CONFLICT DO NOTHING;

-- Insert appointment
INSERT INTO appointments (id, patient_id, provider_id, reason, type, status, date, time)
VALUES (
  '00000000-0000-0000-0000-000000000200',
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000102',
  'Initial Consultation',
  'telemed',
  'confirmed',
  CURRENT_DATE + INTERVAL '1 day',
  '14:00'
)
ON CONFLICT DO NOTHING;

insert into employers (id, name, subdomain, is_active)
values (
  '00000000-0000-0000-0000-000000000100',
  'Demo Employer',
  'healthcare-frontend-five',
  true
)
on conflict (subdomain) do nothing;

-- Add billing config
INSERT INTO billing_configs (employer_id, covered_appointments_per_year, fee_per_visit, family_member_fee, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000100',
  6,
  75.00,
  25.00,
  '2025-07-30T03:14:10.726662'
)
ON CONFLICT DO NOTHING;