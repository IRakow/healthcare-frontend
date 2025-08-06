-- START: 20240124_add_family_member_fee_to_employers.sql

alter table employers add column family_member_fee int default 30;

-- END: 20240124_add_family_member_fee_to_employers.sql


-- START: 20240124_create_family_members_table.sql

create table family_members (
  id uuid primary key default gen_random_uuid(),
  account_holder_id uuid references users(id),
  full_name text,
  birthdate date,
  relation text,
  created_at timestamptz default now()
);

-- END: 20240124_create_family_members_table.sql


-- START: 20240124_create_patient_timeline_events_table.sql

create table patient_timeline_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references users(id),
  type text, -- 'vitals', 'lab', 'visit', 'ai', 'upload'
  label text,
  data jsonb,
  created_at timestamptz default now()
);

-- END: 20240124_create_patient_timeline_events_table.sql


-- START: 20240125_create_assignments_and_timeline_rls.sql

-- Create assignments table to link providers to patients
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references auth.users(id) on delete cascade,
  patient_id uuid references auth.users(id) on delete cascade,
  assigned_at timestamptz default now(),
  assigned_by uuid references auth.users(id),
  active boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(provider_id, patient_id)
);

-- Create indexes for performance
create index idx_assignments_provider_id on assignments(provider_id);
create index idx_assignments_patient_id on assignments(patient_id);
create index idx_assignments_active on assignments(active);

-- Enable RLS on assignments table
alter table assignments enable row level security;

-- RLS policies for assignments table
-- Providers can see their own assignments
create policy "Providers can view own assignments" on assignments
  for select using (auth.uid() = provider_id);

-- Patients can see who is assigned to them
create policy "Patients can view their providers" on assignments
  for select using (auth.uid() = patient_id);

-- Admins can view all assignments
create policy "Admins can view all assignments" on assignments
  for select using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only admins can insert assignments
create policy "Only admins can create assignments" on assignments
  for insert with check (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only admins can update assignments
create policy "Only admins can update assignments" on assignments
  for update using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only admins can delete assignments
create policy "Only admins can delete assignments" on assignments
  for delete using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Enable RLS on patient_timeline_events if not already enabled
alter table patient_timeline_events enable row level security;

-- Drop existing policies if any
drop policy if exists "Patient or Assigned Provider Only" on patient_timeline_events;

-- Create the RLS policy for patient_timeline_events
-- Only allow providers or the patient themselves to view timeline
create policy "Patient or Assigned Provider Only" on patient_timeline_events
  for select using (
    auth.uid() = patient_id
    OR auth.uid() in (
      select provider_id from assignments 
      where patient_id = patient_timeline_events.patient_id 
      and active = true
    )
  );

-- Allow patients to insert their own timeline events
create policy "Patients can insert own events" on patient_timeline_events
  for insert with check (auth.uid() = patient_id);

-- Allow assigned providers to insert timeline events for their patients
create policy "Assigned providers can insert events" on patient_timeline_events
  for insert with check (
    auth.uid() in (
      select provider_id from assignments 
      where patient_id = patient_timeline_events.patient_id 
      and active = true
    )
  );

-- Allow patients and assigned providers to update timeline events
create policy "Patient or assigned provider can update" on patient_timeline_events
  for update using (
    auth.uid() = patient_id
    OR auth.uid() in (
      select provider_id from assignments 
      where patient_id = patient_timeline_events.patient_id 
      and active = true
    )
  );

-- Function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update the updated_at column
create trigger update_assignments_updated_at
  before update on assignments
  for each row
  execute function update_updated_at_column();

-- END: 20240125_create_assignments_and_timeline_rls.sql


-- START: 20240125_enhance_family_members_table.sql

-- Add updated_at column to family_members table
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_family_members_updated_at ON family_members;
CREATE TRIGGER update_family_members_updated_at 
    BEFORE UPDATE ON family_members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Update foreign key to reference auth.users
ALTER TABLE family_members DROP CONSTRAINT IF EXISTS family_members_account_holder_id_fkey;
ALTER TABLE family_members 
    ADD CONSTRAINT family_members_account_holder_id_fkey 
    FOREIGN KEY (account_holder_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Add NOT NULL constraint to account_holder_id
ALTER TABLE family_members ALTER COLUMN account_holder_id SET NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_account_holder_id ON family_members(account_holder_id);
CREATE INDEX IF NOT EXISTS idx_family_members_created_at ON family_members(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_family_members_birthdate ON family_members(birthdate);

-- Enable Row Level Security
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own family members" ON family_members;
DROP POLICY IF EXISTS "Users can insert their own family members" ON family_members;
DROP POLICY IF EXISTS "Users can update their own family members" ON family_members;
DROP POLICY IF EXISTS "Users can delete their own family members" ON family_members;

-- Create RLS policies
-- Policy for viewing: Users can only see their own family members
CREATE POLICY "Users can view their own family members" ON family_members
    FOR SELECT USING (auth.uid() = account_holder_id);

-- Policy for inserting: Users can only add family members to their own account
CREATE POLICY "Users can insert their own family members" ON family_members
    FOR INSERT WITH CHECK (auth.uid() = account_holder_id);

-- Policy for updating: Users can only update their own family members
CREATE POLICY "Users can update their own family members" ON family_members
    FOR UPDATE USING (auth.uid() = account_holder_id)
    WITH CHECK (auth.uid() = account_holder_id);

-- Policy for deleting: Users can only delete their own family members
CREATE POLICY "Users can delete their own family members" ON family_members
    FOR DELETE USING (auth.uid() = account_holder_id);

-- Add comment to table
COMMENT ON TABLE family_members IS 'Stores family members associated with user accounts';
COMMENT ON COLUMN family_members.account_holder_id IS 'References the auth.users id of the account holder';
COMMENT ON COLUMN family_members.full_name IS 'Full name of the family member';
COMMENT ON COLUMN family_members.birthdate IS 'Date of birth of the family member';
COMMENT ON COLUMN family_members.relation IS 'Relationship to the account holder (e.g., spouse, child, parent)';

-- END: 20240125_enhance_family_members_table.sql


-- START: 20240126_create_patient_uploads.sql

-- Create patient_uploads table for medical document management
create table if not exists patient_uploads (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_size bigint,
  type text not null check (type in ('lab', 'referral', 'insurance', 'radiology', 'misc')),
  description text,
  tags text[],
  shared_with text[],
  viewed_at timestamp with time zone,
  preview_url text,
  content_type text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for faster lookups
create index idx_patient_uploads_patient_id on patient_uploads(patient_id);
create index idx_patient_uploads_type on patient_uploads(type);
create index idx_patient_uploads_created_at on patient_uploads(created_at desc);

-- Enable RLS (Row Level Security)
alter table patient_uploads enable row level security;

-- Create policies for patient_uploads
create policy "Patients can view their own uploads"
  on patient_uploads for select
  using (auth.uid() = patient_id);

create policy "Patients can upload their own files"
  on patient_uploads for insert
  with check (auth.uid() = patient_id);

create policy "Patients can update their own uploads"
  on patient_uploads for update
  using (auth.uid() = patient_id);

create policy "Patients can delete their own uploads"
  on patient_uploads for delete
  using (auth.uid() = patient_id);

-- Create trigger to update the updated_at column
create trigger update_patient_uploads_updated_at
  before update on patient_uploads
  for each row
  execute function update_updated_at_column();

-- Create audit_logs table for tracking file access
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  action text not null,
  resource_type text,
  resource_id uuid,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- Create index for audit logs
create index idx_audit_logs_user_id on audit_logs(user_id);
create index idx_audit_logs_created_at on audit_logs(created_at desc);
create index idx_audit_logs_resource on audit_logs(resource_type, resource_id);

-- Enable RLS for audit_logs
alter table audit_logs enable row level security;

-- Policies for audit_logs
create policy "Users can view their own audit logs"
  on audit_logs for select
  using (auth.uid() = user_id);

create policy "System can insert audit logs"
  on audit_logs for insert
  with check (true);

-- Create storage bucket for uploads if not exists
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

-- Create RLS policies for storage bucket
create policy "Users can upload their own files"
  on storage.objects for insert
  with check (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view their own files"
  on storage.objects for select
  using (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own files"
  on storage.objects for delete
  using (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);

-- Create a view for file statistics
create or replace view patient_upload_stats as
select 
  patient_id,
  count(*) as total_files,
  sum(file_size) as total_size,
  count(distinct type) as file_types,
  max(created_at) as last_upload
from patient_uploads
group by patient_id;

-- Grant access to the view
grant select on patient_upload_stats to authenticated;

-- END: 20240126_create_patient_uploads.sql


-- START: 20240126_create_vitals_summary.sql

-- Create vitals_summary table for patient health metrics
create table if not exists vitals_summary (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users(id) on delete cascade,
  sleep_hours numeric(3,1),
  hydration_oz numeric(4,1),
  workouts_this_week integer default 0,
  protein_grams numeric(4,1),
  risk_flags integer default 0,
  heart_rate_avg integer,
  blood_pressure varchar(10),
  stress_level varchar(20),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create an index for faster lookups
create index idx_vitals_summary_patient_id on vitals_summary(patient_id);

-- Enable RLS (Row Level Security)
alter table vitals_summary enable row level security;

-- Create policies for vitals_summary
create policy "Users can view their own vitals"
  on vitals_summary for select
  using (auth.uid() = patient_id);

create policy "Users can insert their own vitals"
  on vitals_summary for insert
  with check (auth.uid() = patient_id);

create policy "Users can update their own vitals"
  on vitals_summary for update
  using (auth.uid() = patient_id);

-- Create a function to automatically update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create a trigger to update the updated_at column
create trigger update_vitals_summary_updated_at
  before update on vitals_summary
  for each row
  execute function update_updated_at_column();

-- Insert sample data for testing (optional)
-- This will only work if you have a test user
-- insert into vitals_summary (patient_id, sleep_hours, hydration_oz, workouts_this_week, protein_grams, risk_flags)
-- values 
--   ('your-user-uuid-here', 7.5, 64, 3, 85, 0);

-- END: 20240126_create_vitals_summary.sql


-- START: 20240126_create_vitals_trend_simple.sql

-- Create vitals_trend table for tracking daily health metrics
create table if not exists vitals_trend (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users(id) on delete cascade,
  date date not null,
  sleep numeric(3,1),
  hydration numeric(4,1),
  protein numeric(4,1),
  created_at timestamp with time zone default now(),
  
  -- Ensure one entry per patient per day
  unique(patient_id, date)
);

-- Create indexes for faster lookups
create index idx_vitals_trend_patient_id on vitals_trend(patient_id);
create index idx_vitals_trend_date on vitals_trend(date desc);

-- Enable RLS (Row Level Security)
alter table vitals_trend enable row level security;

-- Create policies for vitals_trend
create policy "Users can view their own vitals trends"
  on vitals_trend for select
  using (auth.uid() = patient_id);

create policy "Users can insert their own vitals trends"
  on vitals_trend for insert
  with check (auth.uid() = patient_id);

create policy "Users can update their own vitals trends"
  on vitals_trend for update
  using (auth.uid() = patient_id);

create policy "Users can delete their own vitals trends"
  on vitals_trend for delete
  using (auth.uid() = patient_id);

-- Insert sample data for the last 30 days (optional - for testing)
-- Replace 'your-user-uuid' with an actual user ID
/*
DO $$
DECLARE
  user_id uuid := 'your-user-uuid';
  i integer;
BEGIN
  FOR i IN 0..29 LOOP
    INSERT INTO vitals_trend (patient_id, date, sleep, hydration, protein)
    VALUES (
      user_id,
      CURRENT_DATE - i,
      6 + random() * 3,  -- Sleep between 6-9 hours
      50 + random() * 40, -- Hydration between 50-90 oz
      60 + random() * 40  -- Protein between 60-100g
    )
    ON CONFLICT (patient_id, date) DO NOTHING;
  END LOOP;
END $$;
*/

-- END: 20240126_create_vitals_trend_simple.sql


-- START: 20240126_create_vitals_trend.sql

-- Create vitals_trend table for tracking daily health metrics over time
create table if not exists vitals_trend (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users(id) on delete cascade,
  date date not null,
  sleep numeric(3,1),
  hydration numeric(4,1),
  protein numeric(4,1),
  steps integer,
  calories integer,
  heart_rate_avg integer,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  weight numeric(5,2),
  mood_score integer check (mood_score >= 1 and mood_score <= 10),
  energy_level integer check (energy_level >= 1 and energy_level <= 10),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Ensure one entry per patient per day
  unique(patient_id, date)
);

-- Create indexes for faster lookups
create index idx_vitals_trend_patient_id on vitals_trend(patient_id);
create index idx_vitals_trend_date on vitals_trend(date desc);
create index idx_vitals_trend_patient_date on vitals_trend(patient_id, date desc);

-- Enable RLS (Row Level Security)
alter table vitals_trend enable row level security;

-- Create policies for vitals_trend
create policy "Users can view their own vitals trends"
  on vitals_trend for select
  using (auth.uid() = patient_id);

create policy "Users can insert their own vitals trends"
  on vitals_trend for insert
  with check (auth.uid() = patient_id);

create policy "Users can update their own vitals trends"
  on vitals_trend for update
  using (auth.uid() = patient_id);

create policy "Users can delete their own vitals trends"
  on vitals_trend for delete
  using (auth.uid() = patient_id);

-- Create a function to automatically update the updated_at timestamp
create trigger update_vitals_trend_updated_at
  before update on vitals_trend
  for each row
  execute function update_updated_at_column();

-- Create a view for easy access to the last 30 days of trends
create or replace view vitals_trend_last_30_days as
select 
  vt.*,
  to_char(vt.date, 'Mon DD') as formatted_date,
  to_char(vt.date, 'Day') as day_name
from vitals_trend vt
where vt.date >= current_date - interval '30 days'
order by vt.date desc;

-- Grant access to the view
grant select on vitals_trend_last_30_days to authenticated;

-- Create a function to get weekly averages
create or replace function get_weekly_vitals_average(p_patient_id uuid)
returns table(
  week_start date,
  avg_sleep numeric,
  avg_hydration numeric,
  avg_protein numeric,
  avg_steps numeric,
  avg_calories numeric,
  avg_heart_rate numeric
) as $$
begin
  return query
  select 
    date_trunc('week', date)::date as week_start,
    round(avg(sleep), 1) as avg_sleep,
    round(avg(hydration), 1) as avg_hydration,
    round(avg(protein), 1) as avg_protein,
    round(avg(steps), 0) as avg_steps,
    round(avg(calories), 0) as avg_calories,
    round(avg(heart_rate_avg), 0) as avg_heart_rate
  from vitals_trend
  where patient_id = p_patient_id
    and date >= current_date - interval '12 weeks'
  group by date_trunc('week', date)
  order by week_start desc;
end;
$$ language plpgsql security definer;

-- Sample data insertion (commented out, uncomment and modify for testing)
-- insert into vitals_trend (patient_id, date, sleep, hydration, protein, steps, calories, heart_rate_avg, mood_score, energy_level)
-- values 
--   ('your-user-uuid', current_date, 7.5, 64, 85, 8432, 2100, 72, 8, 7),
--   ('your-user-uuid', current_date - 1, 6.8, 72, 92, 10150, 2350, 75, 7, 6),
--   ('your-user-uuid', current_date - 2, 8.2, 80, 78, 6890, 1950, 70, 9, 8);

-- END: 20240126_create_vitals_trend.sql


-- START: 20240127_add_indexes.sql

-- Add indexes for better query performance

-- Index on vitals_summary for patient lookups
CREATE INDEX IF NOT EXISTS idx_vitals_summary_patient_id ON vitals_summary (patient_id);

-- Index on patient_uploads for patient lookups (if not already exists)
CREATE INDEX IF NOT EXISTS idx_patient_uploads_patient_id ON patient_uploads (patient_id);

-- Index on conversation_insights for user lookups
CREATE INDEX IF NOT EXISTS idx_conversation_insights_user_id ON conversation_insights (user_id);

-- Additional helpful indexes for conversation_insights
CREATE INDEX IF NOT EXISTS idx_conversation_insights_created_at ON conversation_insights (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_insights_user_created ON conversation_insights (user_id, created_at DESC);

-- END: 20240127_add_indexes.sql


-- START: 20240127_add_prescriber_provider_check.sql

-- Add function to check if a user has provider role
CREATE OR REPLACE FUNCTION is_provider(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = $1 
    AND r.name = 'provider'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add check constraint to medications table to ensure prescriber is a provider
ALTER TABLE medications
ADD CONSTRAINT prescriber_must_be_provider
CHECK (prescriber_id IS NULL OR is_provider(prescriber_id));

-- Create index on user_roles for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON user_roles(user_id, role_id);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT prescriber_must_be_provider ON medications IS 
'Ensures that prescriber_id references a user with provider role';

-- Create a trigger to validate prescriber role on insert/update
CREATE OR REPLACE FUNCTION validate_prescriber_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.prescriber_id IS NOT NULL AND NOT is_provider(NEW.prescriber_id) THEN
    RAISE EXCEPTION 'Prescriber must have provider role';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for additional validation
CREATE TRIGGER ensure_prescriber_is_provider
  BEFORE INSERT OR UPDATE OF prescriber_id ON medications
  FOR EACH ROW
  EXECUTE FUNCTION validate_prescriber_role();

-- Add RLS policy for providers to prescribe medications
CREATE POLICY "Providers can prescribe medications"
  ON medications FOR INSERT
  WITH CHECK (
    auth.uid() = prescriber_id 
    AND is_provider(auth.uid())
  );

-- Update existing RLS policy for providers to view medications they prescribed
CREATE POLICY "Providers can view medications they prescribed"
  ON medications FOR SELECT
  USING (
    auth.uid() = prescriber_id 
    OR auth.uid() = patient_id
  );

-- Add helper view for provider prescriptions
CREATE OR REPLACE VIEW provider_prescriptions AS
SELECT 
  m.*,
  p.raw_user_meta_data->>'name' as patient_name,
  pr.raw_user_meta_data->>'name' as prescriber_name
FROM medications m
JOIN auth.users p ON m.patient_id = p.id
LEFT JOIN auth.users pr ON m.prescriber_id = pr.id
WHERE m.prescriber_id IS NOT NULL;

-- Grant access to the view for authenticated users
GRANT SELECT ON provider_prescriptions TO authenticated;

-- END: 20240127_add_prescriber_provider_check.sql


-- START: 20240127_complete_billing_system.sql

-- Complete billing system migration
-- This consolidates all billing-related tables and functions

-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS plan_features CASCADE;
DROP TABLE IF EXISTS billing_line_items CASCADE;
DROP TABLE IF EXISTS direct_memberships CASCADE;
DROP TABLE IF EXISTS patient_payments CASCADE;
DROP TABLE IF EXISTS employer_invoices CASCADE;
DROP TABLE IF EXISTS appointment_usage CASCADE;
DROP TABLE IF EXISTS billing_configs CASCADE;
DROP TABLE IF EXISTS billing_periods CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS employer_patients CASCADE;
DROP TABLE IF EXISTS employers CASCADE;

-- Create employers table (enhanced version)
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  billing_email TEXT,
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  branding JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  price_per_employee DECIMAL(10,2) NOT NULL,
  price_per_family_member DECIMAL(10,2),
  included_visits_per_year INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for employers
CREATE INDEX idx_employers_name ON employers(name);
CREATE INDEX idx_employers_is_active ON employers(is_active);
CREATE INDEX idx_employers_created_at ON employers(created_at DESC);

-- Create employer_patients table
CREATE TABLE employer_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_primary_account BOOLEAN DEFAULT TRUE,
  family_members INTEGER DEFAULT 0,
  employee_id TEXT,
  department TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN GENERATED ALWAYS AS (end_date IS NULL OR end_date > CURRENT_DATE) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique active employment per patient
  UNIQUE(employer_id, patient_id, end_date)
);

-- Create indexes for employer_patients
CREATE INDEX idx_employer_patients_employer_id ON employer_patients(employer_id);
CREATE INDEX idx_employer_patients_patient_id ON employer_patients(patient_id);
CREATE INDEX idx_employer_patients_is_active ON employer_patients(is_active);
CREATE INDEX idx_employer_patients_dates ON employer_patients(start_date, end_date);

-- Create appointment_usage table for tracking visit usage
CREATE TABLE appointment_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  billing_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  used_on TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one usage record per appointment
  UNIQUE(appointment_id)
);

-- Create indexes for appointment_usage
CREATE INDEX idx_appointment_usage_patient_id ON appointment_usage(patient_id);
CREATE INDEX idx_appointment_usage_employer_id ON appointment_usage(employer_id);
CREATE INDEX idx_appointment_usage_billing_year ON appointment_usage(billing_year);

-- Create employer_invoices table
CREATE TABLE employer_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE,
  invoice_month DATE NOT NULL,
  total_employees INTEGER,
  total_family_members INTEGER,
  total_visits INTEGER DEFAULT 0,
  included_visits INTEGER DEFAULT 0,
  billable_visits INTEGER DEFAULT 0,
  base_charges DECIMAL(10,2) DEFAULT 0,
  visit_charges DECIMAL(10,2) DEFAULT 0,
  total_due DECIMAL(10,2),
  status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')) DEFAULT 'pending',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_reference TEXT,
  notes TEXT,
  
  -- Ensure unique invoice per employer per month
  UNIQUE(employer_id, invoice_month)
);

-- Create indexes for employer_invoices
CREATE INDEX idx_employer_invoices_employer_id ON employer_invoices(employer_id);
CREATE INDEX idx_employer_invoices_invoice_month ON employer_invoices(invoice_month);
CREATE INDEX idx_employer_invoices_status ON employer_invoices(status);

-- Create patient_payments table for direct patient payments
CREATE TABLE patient_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('valor_paytech', 'stripe', 'cash', 'insurance')),
  transaction_id TEXT,
  status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for patient_payments
CREATE INDEX idx_patient_payments_patient_id ON patient_payments(patient_id);
CREATE INDEX idx_patient_payments_appointment_id ON patient_payments(appointment_id);
CREATE INDEX idx_patient_payments_status ON patient_payments(status);

-- Create direct_memberships table for non-employer patients
CREATE TABLE direct_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_type TEXT CHECK (plan_type IN ('individual', 'family')) NOT NULL,
  monthly_fee DECIMAL(10,2) NOT NULL,
  family_members INTEGER DEFAULT 0,
  included_visits_per_month INTEGER DEFAULT 2,
  next_billing_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  cancellation_date DATE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for direct_memberships
CREATE INDEX idx_direct_memberships_patient_id ON direct_memberships(patient_id);
CREATE INDEX idx_direct_memberships_is_active ON direct_memberships(is_active);
CREATE INDEX idx_direct_memberships_next_billing_date ON direct_memberships(next_billing_date);

-- Create billing_configs table for advanced employer configurations
CREATE TABLE billing_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE UNIQUE,
  base_rate_per_employee DECIMAL(10,2),
  base_rate_per_family_member DECIMAL(10,2),
  visit_included_per_user INTEGER DEFAULT 0,
  visit_price DECIMAL(10,2),
  billing_frequency TEXT CHECK (billing_frequency IN ('monthly', 'quarterly', 'annually')) DEFAULT 'monthly',
  grace_period_days INTEGER DEFAULT 30,
  allow_family_members BOOLEAN DEFAULT true,
  max_family_members_per_account INTEGER DEFAULT 5,
  subscription_type TEXT CHECK (subscription_type IN ('employer', 'direct', 'hybrid')) DEFAULT 'employer',
  custom_plan_name TEXT,
  custom_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for billing_configs
CREATE INDEX idx_billing_configs_employer_id ON billing_configs(employer_id);
CREATE INDEX idx_billing_configs_is_active ON billing_configs(is_active);

-- Create billing_line_items table for detailed invoice breakdowns
CREATE TABLE billing_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES employer_invoices(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  unit_count INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) GENERATED ALWAYS AS (unit_count * unit_price) STORED,
  item_type TEXT CHECK (item_type IN ('subscription', 'visit', 'adjustment', 'credit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for billing_line_items
CREATE INDEX idx_billing_line_items_invoice_id ON billing_line_items(invoice_id);
CREATE INDEX idx_billing_line_items_patient_id ON billing_line_items(patient_id);

-- Create plan_features table for feature toggles
CREATE TABLE plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES billing_configs(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  feature_name TEXT,
  description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  additional_cost DECIMAL(10,2) DEFAULT 0.00,
  usage_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique features per config
  UNIQUE(config_id, feature_key)
);

-- Create indexes for plan_features
CREATE INDEX idx_plan_features_config_id ON plan_features(config_id);
CREATE INDEX idx_plan_features_is_enabled ON plan_features(is_enabled);

-- Enable RLS on all tables
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employers
CREATE POLICY "Owners can manage all employers"
  ON employers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'owner'
    )
  );

-- RLS Policies for employer_patients
CREATE POLICY "Patients can view their own employer relationships"
  ON employer_patients FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Owners can manage all employer-patient relationships"
  ON employer_patients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'owner'
    )
  );

-- RLS Policies for appointment_usage
CREATE POLICY "Patients can view their own usage"
  ON appointment_usage FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "System can manage appointment usage"
  ON appointment_usage FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('owner', 'admin')
    )
  );

-- RLS Policies for patient_payments
CREATE POLICY "Patients can view their own payments"
  ON patient_payments FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create their own payments"
  ON patient_payments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- RLS Policies for direct_memberships
CREATE POLICY "Patients can view their own membership"
  ON direct_memberships FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Owners can manage all memberships"
  ON direct_memberships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'owner'
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_employers_updated_at
  BEFORE UPDATE ON employers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_patients_updated_at
  BEFORE UPDATE ON employer_patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_configs_updated_at
  BEFORE UPDATE ON billing_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_direct_memberships_updated_at
  BEFORE UPDATE ON direct_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate monthly invoice for an employer
CREATE OR REPLACE FUNCTION generate_monthly_employer_invoice(
  p_employer_id UUID,
  p_invoice_month DATE
)
RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID;
  v_employer employers;
  v_config billing_configs;
  v_employee_count INTEGER;
  v_family_count INTEGER;
  v_total_visits INTEGER;
  v_included_visits INTEGER;
  v_billable_visits INTEGER;
  v_base_charges DECIMAL(10,2) := 0;
  v_visit_charges DECIMAL(10,2) := 0;
  v_total_due DECIMAL(10,2) := 0;
BEGIN
  -- Get employer details
  SELECT * INTO v_employer FROM employers WHERE id = p_employer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Employer not found';
  END IF;

  -- Get billing config (optional override)
  SELECT * INTO v_config FROM billing_configs 
  WHERE employer_id = p_employer_id AND is_active = true;

  -- Count active employees for the month
  SELECT COUNT(DISTINCT patient_id) INTO v_employee_count
  FROM employer_patients
  WHERE employer_id = p_employer_id
    AND start_date <= (p_invoice_month + INTERVAL '1 month - 1 day')::DATE
    AND (end_date IS NULL OR end_date >= p_invoice_month);

  -- Count family members
  SELECT COALESCE(SUM(family_members), 0) INTO v_family_count
  FROM employer_patients
  WHERE employer_id = p_employer_id
    AND is_primary_account = true
    AND start_date <= (p_invoice_month + INTERVAL '1 month - 1 day')::DATE
    AND (end_date IS NULL OR end_date >= p_invoice_month);

  -- Count visits for the month
  SELECT COUNT(*) INTO v_total_visits
  FROM appointment_usage au
  JOIN appointments a ON au.appointment_id = a.id
  WHERE au.employer_id = p_employer_id
    AND a.appointment_date >= p_invoice_month
    AND a.appointment_date < p_invoice_month + INTERVAL '1 month'
    AND a.status = 'completed';

  -- Calculate charges using config or employer defaults
  IF v_config IS NOT NULL THEN
    v_base_charges := (v_employee_count * COALESCE(v_config.base_rate_per_employee, 0)) +
                      (v_family_count * COALESCE(v_config.base_rate_per_family_member, 0));
    v_included_visits := v_config.visit_included_per_user * (v_employee_count + v_family_count);
    v_billable_visits := GREATEST(0, v_total_visits - v_included_visits);
    v_visit_charges := v_billable_visits * COALESCE(v_config.visit_price, 0);
  ELSE
    v_base_charges := (v_employee_count * v_employer.price_per_employee) +
                      (v_family_count * COALESCE(v_employer.price_per_family_member, 0));
    -- Pro-rate annual visits to monthly
    v_included_visits := ROUND(v_employer.included_visits_per_year::NUMERIC / 12 * (v_employee_count + v_family_count));
    v_billable_visits := GREATEST(0, v_total_visits - v_included_visits);
    -- Default visit price if not in config
    v_visit_charges := v_billable_visits * 75; -- Default $75 per extra visit
  END IF;

  v_total_due := v_base_charges + v_visit_charges;

  -- Create invoice
  INSERT INTO employer_invoices (
    employer_id,
    invoice_number,
    invoice_month,
    total_employees,
    total_family_members,
    total_visits,
    included_visits,
    billable_visits,
    base_charges,
    visit_charges,
    total_due
  ) VALUES (
    p_employer_id,
    'INV-' || TO_CHAR(p_invoice_month, 'YYYYMM') || '-' || SUBSTRING(p_employer_id::TEXT, 1, 8),
    p_invoice_month,
    v_employee_count,
    v_family_count,
    v_total_visits,
    v_included_visits,
    v_billable_visits,
    v_base_charges,
    v_visit_charges,
    v_total_due
  )
  ON CONFLICT (employer_id, invoice_month) 
  DO UPDATE SET
    total_employees = EXCLUDED.total_employees,
    total_family_members = EXCLUDED.total_family_members,
    total_visits = EXCLUDED.total_visits,
    included_visits = EXCLUDED.included_visits,
    billable_visits = EXCLUDED.billable_visits,
    base_charges = EXCLUDED.base_charges,
    visit_charges = EXCLUDED.visit_charges,
    total_due = EXCLUDED.total_due,
    generated_at = NOW()
  RETURNING id INTO v_invoice_id;

  -- Create line items
  -- Base subscription charges
  IF v_employee_count > 0 THEN
    INSERT INTO billing_line_items (invoice_id, description, unit_count, unit_price, item_type)
    VALUES (
      v_invoice_id,
      'Employee Subscriptions',
      v_employee_count,
      COALESCE(v_config.base_rate_per_employee, v_employer.price_per_employee),
      'subscription'
    );
  END IF;

  IF v_family_count > 0 THEN
    INSERT INTO billing_line_items (invoice_id, description, unit_count, unit_price, item_type)
    VALUES (
      v_invoice_id,
      'Family Member Subscriptions',
      v_family_count,
      COALESCE(v_config.base_rate_per_family_member, v_employer.price_per_family_member),
      'subscription'
    );
  END IF;

  -- Visit charges
  IF v_billable_visits > 0 THEN
    INSERT INTO billing_line_items (invoice_id, description, unit_count, unit_price, item_type)
    VALUES (
      v_invoice_id,
      'Additional Visits (beyond ' || v_included_visits || ' included)',
      v_billable_visits,
      COALESCE(v_config.visit_price, 75.00),
      'visit'
    );
  END IF;

  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check visit allowance
CREATE OR REPLACE FUNCTION check_visit_allowance(
  p_patient_id UUID,
  p_appointment_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  has_coverage BOOLEAN,
  coverage_type TEXT,
  visits_used INTEGER,
  visits_allowed INTEGER,
  visits_remaining INTEGER,
  requires_payment BOOLEAN
) AS $$
DECLARE
  v_employer_id UUID;
  v_direct_membership direct_memberships;
  v_employer employers;
  v_config billing_configs;
  v_year INTEGER := EXTRACT(YEAR FROM p_appointment_date);
  v_month DATE := DATE_TRUNC('month', p_appointment_date);
  v_visits_used INTEGER := 0;
  v_visits_allowed INTEGER := 0;
BEGIN
  -- Check employer coverage
  SELECT ep.employer_id INTO v_employer_id
  FROM employer_patients ep
  WHERE ep.patient_id = p_patient_id
    AND ep.start_date <= p_appointment_date
    AND (ep.end_date IS NULL OR ep.end_date >= p_appointment_date)
  LIMIT 1;

  IF v_employer_id IS NOT NULL THEN
    -- Get employer and config
    SELECT * INTO v_employer FROM employers WHERE id = v_employer_id;
    SELECT * INTO v_config FROM billing_configs WHERE employer_id = v_employer_id AND is_active = true;
    
    -- Count visits used this year
    SELECT COUNT(*) INTO v_visits_used
    FROM appointment_usage
    WHERE patient_id = p_patient_id
      AND employer_id = v_employer_id
      AND billing_year = v_year;
    
    -- Calculate allowed visits
    IF v_config IS NOT NULL AND v_config.visit_included_per_user > 0 THEN
      -- Use monthly allowance from config
      v_visits_allowed := v_config.visit_included_per_user * 12;
    ELSE
      -- Use annual allowance from employer
      v_visits_allowed := v_employer.included_visits_per_year;
    END IF;
    
    RETURN QUERY SELECT 
      true,
      'employer'::TEXT,
      v_visits_used,
      v_visits_allowed,
      GREATEST(0, v_visits_allowed - v_visits_used),
      (v_visits_used >= v_visits_allowed);
  ELSE
    -- Check direct membership
    SELECT * INTO v_direct_membership
    FROM direct_memberships
    WHERE patient_id = p_patient_id
      AND is_active = true
      AND next_billing_date > p_appointment_date;
    
    IF v_direct_membership IS NOT NULL THEN
      -- Count visits used this month
      SELECT COUNT(*) INTO v_visits_used
      FROM appointments
      WHERE patient_id = p_patient_id
        AND appointment_date >= v_month
        AND appointment_date < v_month + INTERVAL '1 month'
        AND status = 'completed';
      
      v_visits_allowed := v_direct_membership.included_visits_per_month;
      
      RETURN QUERY SELECT 
        true,
        'direct'::TEXT,
        v_visits_used,
        v_visits_allowed,
        GREATEST(0, v_visits_allowed - v_visits_used),
        (v_visits_used >= v_visits_allowed);
    ELSE
      -- No coverage
      RETURN QUERY SELECT 
        false,
        'none'::TEXT,
        0,
        0,
        0,
        true;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Views for reporting
CREATE OR REPLACE VIEW employer_billing_summary AS
SELECT 
  e.id as employer_id,
  e.name as employer_name,
  e.billing_email,
  COUNT(DISTINCT ep.patient_id) as active_employees,
  COALESCE(SUM(ep.family_members), 0) as total_family_members,
  COUNT(DISTINCT ei.id) as total_invoices,
  COALESCE(SUM(CASE WHEN ei.status = 'paid' THEN ei.total_due ELSE 0 END), 0) as total_paid,
  COALESCE(SUM(CASE WHEN ei.status = 'pending' THEN ei.total_due ELSE 0 END), 0) as total_pending
FROM employers e
LEFT JOIN employer_patients ep ON e.id = ep.employer_id AND ep.is_active = true
LEFT JOIN employer_invoices ei ON e.id = ei.employer_id
WHERE e.is_active = true
GROUP BY e.id, e.name, e.billing_email;

-- Grant permissions
GRANT SELECT ON employer_billing_summary TO authenticated;
GRANT EXECUTE ON FUNCTION generate_monthly_employer_invoice TO authenticated;
GRANT EXECUTE ON FUNCTION check_visit_allowance TO authenticated;

-- END: 20240127_complete_billing_system.sql


-- START: 20240127_create_billing_configs.sql

-- Create billing configurations table for employer-specific pricing
CREATE TABLE billing_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) UNIQUE,
  base_rate_per_employee DECIMAL(10,2),
  base_rate_per_family_member DECIMAL(10,2),
  visit_included_per_user INTEGER DEFAULT 0,
  visit_price DECIMAL(10,2),
  billing_frequency TEXT CHECK (billing_frequency IN ('monthly', 'quarterly')) DEFAULT 'monthly',
  grace_period_days INTEGER DEFAULT 0,
  allow_family_members BOOLEAN DEFAULT true,
  max_family_members_per_account INTEGER DEFAULT 5,
  subscription_type TEXT CHECK (subscription_type IN ('employer', 'direct')) DEFAULT 'employer',
  custom_plan_name TEXT,
  custom_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for billing configs
CREATE INDEX idx_billing_configs_employer_id ON billing_configs(employer_id);
CREATE INDEX idx_billing_configs_is_active ON billing_configs(is_active);

-- Create family members table to track dependents
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT CHECK (relationship IN ('spouse', 'child', 'parent', 'other')),
  date_of_birth DATE,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for family members
CREATE INDEX idx_family_members_primary_patient ON family_members(primary_patient_id);
CREATE INDEX idx_family_members_is_active ON family_members(is_active);

-- Create billing periods table to track billing cycles
CREATE TABLE billing_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'finalized', 'invoiced', 'paid')) DEFAULT 'draft',
  employee_count INTEGER DEFAULT 0,
  family_member_count INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  billable_visits INTEGER DEFAULT 0,
  base_charges DECIMAL(10,2) DEFAULT 0,
  visit_charges DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  invoice_id UUID REFERENCES invoices(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique billing periods per employer
  UNIQUE(employer_id, period_start, period_end)
);

-- Create indexes for billing periods
CREATE INDEX idx_billing_periods_employer_id ON billing_periods(employer_id);
CREATE INDEX idx_billing_periods_dates ON billing_periods(period_start, period_end);
CREATE INDEX idx_billing_periods_status ON billing_periods(status);

-- Enable RLS
ALTER TABLE billing_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_periods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for billing_configs
CREATE POLICY "Owners can manage all billing configs"
  ON billing_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'owner'
    )
  );

CREATE POLICY "Admins can view billing configs"
  ON billing_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- RLS Policies for family_members
CREATE POLICY "Patients can manage their family members"
  ON family_members FOR ALL
  USING (auth.uid() = primary_patient_id);

CREATE POLICY "Providers can view family members of their patients"
  ON family_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.provider_id = auth.uid() 
      AND a.patient_id = family_members.primary_patient_id
    )
  );

-- RLS Policies for billing_periods
CREATE POLICY "Owners can manage all billing periods"
  ON billing_periods FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'owner'
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_billing_configs_updated_at
  BEFORE UPDATE ON billing_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_periods_updated_at
  BEFORE UPDATE ON billing_periods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate billing for a period
CREATE OR REPLACE FUNCTION calculate_billing_period(
  p_employer_id UUID,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS billing_periods AS $$
DECLARE
  v_config billing_configs;
  v_period billing_periods;
  v_employee_count INTEGER;
  v_family_count INTEGER;
  v_total_visits INTEGER;
  v_billable_visits INTEGER;
  v_base_charges DECIMAL(10,2) := 0;
  v_visit_charges DECIMAL(10,2) := 0;
BEGIN
  -- Get billing config
  SELECT * INTO v_config
  FROM billing_configs
  WHERE employer_id = p_employer_id AND is_active = true;

  IF v_config IS NULL THEN
    RAISE EXCEPTION 'No active billing configuration found for employer';
  END IF;

  -- Count active employees
  SELECT COUNT(DISTINCT patient_id) INTO v_employee_count
  FROM employer_patients
  WHERE employer_id = p_employer_id
    AND is_active = true
    AND start_date <= p_period_end
    AND (end_date IS NULL OR end_date >= p_period_start);

  -- Count family members if allowed
  IF v_config.allow_family_members THEN
    SELECT COUNT(*) INTO v_family_count
    FROM family_members fm
    JOIN employer_patients ep ON fm.primary_patient_id = ep.patient_id
    WHERE ep.employer_id = p_employer_id
      AND fm.is_active = true
      AND ep.is_active = true;
  ELSE
    v_family_count := 0;
  END IF;

  -- Count total visits in period
  SELECT COUNT(*) INTO v_total_visits
  FROM appointments a
  JOIN employer_patients ep ON a.patient_id = ep.patient_id
  WHERE ep.employer_id = p_employer_id
    AND a.appointment_date BETWEEN p_period_start AND p_period_end
    AND a.status = 'completed';

  -- Calculate base charges
  v_base_charges := (v_employee_count * COALESCE(v_config.base_rate_per_employee, 0)) +
                    (v_family_count * COALESCE(v_config.base_rate_per_family_member, 0));

  -- Calculate billable visits (total - included)
  v_billable_visits := GREATEST(0, v_total_visits - (v_config.visit_included_per_user * (v_employee_count + v_family_count)));
  
  -- Calculate visit charges
  v_visit_charges := v_billable_visits * COALESCE(v_config.visit_price, 0);

  -- Insert or update billing period
  INSERT INTO billing_periods (
    employer_id,
    period_start,
    period_end,
    employee_count,
    family_member_count,
    total_visits,
    billable_visits,
    base_charges,
    visit_charges,
    total_amount
  ) VALUES (
    p_employer_id,
    p_period_start,
    p_period_end,
    v_employee_count,
    v_family_count,
    v_total_visits,
    v_billable_visits,
    v_base_charges,
    v_visit_charges,
    v_base_charges + v_visit_charges
  )
  ON CONFLICT (employer_id, period_start, period_end)
  DO UPDATE SET
    employee_count = EXCLUDED.employee_count,
    family_member_count = EXCLUDED.family_member_count,
    total_visits = EXCLUDED.total_visits,
    billable_visits = EXCLUDED.billable_visits,
    base_charges = EXCLUDED.base_charges,
    visit_charges = EXCLUDED.visit_charges,
    total_amount = EXCLUDED.total_amount,
    updated_at = NOW()
  RETURNING * INTO v_period;

  RETURN v_period;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate subscription-based invoice
CREATE OR REPLACE FUNCTION generate_subscription_invoice(
  p_employer_id UUID,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS UUID AS $$
DECLARE
  v_period billing_periods;
  v_invoice_id UUID;
  v_employer employers;
  v_config billing_configs;
BEGIN
  -- Calculate billing period
  v_period := calculate_billing_period(p_employer_id, p_period_start, p_period_end);
  
  -- Get employer and config details
  SELECT * INTO v_employer FROM employers WHERE id = p_employer_id;
  SELECT * INTO v_config FROM billing_configs WHERE employer_id = p_employer_id;

  -- Create invoice
  INSERT INTO invoices (
    invoice_number,
    employer_id,
    issue_date,
    due_date,
    status,
    total_amount,
    metadata
  ) VALUES (
    'SUB-' || p_employer_id::TEXT || '-' || TO_CHAR(p_period_start, 'YYYYMM'),
    p_employer_id,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 day' * COALESCE(v_config.grace_period_days, 30),
    'pending',
    v_period.total_amount,
    JSONB_BUILD_OBJECT(
      'type', 'subscription',
      'period_id', v_period.id,
      'period_start', p_period_start,
      'period_end', p_period_end,
      'employee_count', v_period.employee_count,
      'family_member_count', v_period.family_member_count,
      'total_visits', v_period.total_visits,
      'billable_visits', v_period.billable_visits,
      'base_charges', v_period.base_charges,
      'visit_charges', v_period.visit_charges,
      'plan_name', v_config.custom_plan_name,
      'billing_frequency', v_config.billing_frequency
    )
  ) RETURNING id INTO v_invoice_id;

  -- Update billing period with invoice reference
  UPDATE billing_periods
  SET invoice_id = v_invoice_id, status = 'invoiced'
  WHERE id = v_period.id;

  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for billing period details
CREATE OR REPLACE VIEW billing_period_details AS
SELECT 
  bp.*,
  e.name as employer_name,
  bc.custom_plan_name,
  bc.billing_frequency,
  bc.base_rate_per_employee,
  bc.base_rate_per_family_member,
  bc.visit_price,
  bc.visit_included_per_user,
  i.invoice_number,
  i.status as invoice_status
FROM billing_periods bp
JOIN employers e ON bp.employer_id = e.id
LEFT JOIN billing_configs bc ON e.id = bc.employer_id
LEFT JOIN invoices i ON bp.invoice_id = i.id;

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_billing_period TO authenticated;
GRANT EXECUTE ON FUNCTION generate_subscription_invoice TO authenticated;
GRANT SELECT ON billing_period_details TO authenticated;

-- Sample data (commented out)
/*
-- Create billing config for an employer
INSERT INTO billing_configs (
  employer_id,
  base_rate_per_employee,
  base_rate_per_family_member,
  visit_included_per_user,
  visit_price,
  custom_plan_name
) VALUES (
  'employer-uuid-here',
  50.00,  -- $50 per employee
  25.00,  -- $25 per family member
  2,      -- 2 visits included per person
  75.00,  -- $75 per additional visit
  'Premium Health Plan'
);

-- Calculate billing for current month
SELECT calculate_billing_period(
  'employer-uuid-here',
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE
);
*/

-- END: 20240127_create_billing_configs.sql


-- START: 20240127_create_employers_tables.sql

-- Employers table for managing employer organizations
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  branding JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for employers
CREATE INDEX idx_employers_name ON employers(name);
CREATE INDEX idx_employers_is_active ON employers(is_active);
CREATE INDEX idx_employers_created_at ON employers(created_at DESC);

-- Employer-patient relationship table
CREATE TABLE employer_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT,
  department TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN GENERATED ALWAYS AS (end_date IS NULL OR end_date > CURRENT_DATE) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique active employment per patient
  UNIQUE(employer_id, patient_id, end_date)
);

-- Create indexes for employer_patients
CREATE INDEX idx_employer_patients_employer_id ON employer_patients(employer_id);
CREATE INDEX idx_employer_patients_patient_id ON employer_patients(patient_id);
CREATE INDEX idx_employer_patients_is_active ON employer_patients(is_active);
CREATE INDEX idx_employer_patients_dates ON employer_patients(start_date, end_date);

-- Add employer_id to invoices table
ALTER TABLE invoices 
ADD COLUMN employer_id UUID REFERENCES employers(id);

-- Create index for employer invoices
CREATE INDEX idx_invoices_employer_id ON invoices(employer_id);

-- Enable RLS for employers
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_patients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employers table
CREATE POLICY "Owners can manage all employers"
  ON employers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'owner'
    )
  );

CREATE POLICY "Admins can view all employers"
  ON employers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- RLS Policies for employer_patients
CREATE POLICY "Owners can manage all employer-patient relationships"
  ON employer_patients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'owner'
    )
  );

CREATE POLICY "Patients can view their own employer relationships"
  ON employer_patients FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Providers can view employer info for their patients"
  ON employer_patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.provider_id = auth.uid() 
      AND a.patient_id = employer_patients.patient_id
    )
  );

-- Create trigger to update updated_at columns
CREATE TRIGGER update_employers_updated_at
  BEFORE UPDATE ON employers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_patients_updated_at
  BEFORE UPDATE ON employer_patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for active employer-patient relationships
CREATE OR REPLACE VIEW active_employer_patients AS
SELECT 
  ep.*,
  e.name as employer_name,
  e.logo_url as employer_logo,
  e.branding as employer_branding,
  p.raw_user_meta_data->>'name' as patient_name,
  p.email as patient_email
FROM employer_patients ep
JOIN employers e ON ep.employer_id = e.id
JOIN auth.users p ON ep.patient_id = p.id
WHERE ep.is_active = true
  AND e.is_active = true;

-- Grant access to the view
GRANT SELECT ON active_employer_patients TO authenticated;

-- Create view for employer invoice summary
CREATE OR REPLACE VIEW employer_invoice_summary AS
SELECT 
  e.id as employer_id,
  e.name as employer_name,
  COUNT(DISTINCT i.id) as total_invoices,
  COUNT(DISTINCT CASE WHEN i.status = 'paid' THEN i.id END) as paid_invoices,
  COUNT(DISTINCT CASE WHEN i.status = 'pending' THEN i.id END) as pending_invoices,
  COALESCE(SUM(i.total_amount), 0) as total_amount,
  COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0) as paid_amount,
  COALESCE(SUM(CASE WHEN i.status = 'pending' THEN i.total_amount ELSE 0 END), 0) as pending_amount,
  MAX(i.created_at) as last_invoice_date
FROM employers e
LEFT JOIN invoices i ON e.id = i.employer_id
GROUP BY e.id, e.name;

-- Grant access to the view
GRANT SELECT ON employer_invoice_summary TO authenticated;

-- Function to get patient's current employer
CREATE OR REPLACE FUNCTION get_patient_current_employer(p_patient_id UUID)
RETURNS TABLE(
  employer_id UUID,
  employer_name TEXT,
  start_date DATE,
  employee_id TEXT,
  department TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.employer_id,
    e.name as employer_name,
    ep.start_date,
    ep.employee_id,
    ep.department
  FROM employer_patients ep
  JOIN employers e ON ep.employer_id = e.id
  WHERE ep.patient_id = p_patient_id
    AND ep.is_active = true
    AND e.is_active = true
  ORDER BY ep.start_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data (commented out)
/*
INSERT INTO employers (name, contact_email) VALUES
  ('Acme Corporation', 'hr@acme.com'),
  ('Tech Innovators LLC', 'benefits@techinnovators.com'),
  ('Healthcare Partners', 'admin@healthcarepartners.com');

-- Link patients to employers (replace with actual patient IDs)
INSERT INTO employer_patients (employer_id, patient_id, start_date) VALUES
  ((SELECT id FROM employers WHERE name = 'Acme Corporation'), 'patient-uuid-1', '2024-01-01'),
  ((SELECT id FROM employers WHERE name = 'Tech Innovators LLC'), 'patient-uuid-2', '2023-06-15');
*/

-- END: 20240127_create_employers_tables.sql


-- START: 20240127_employer_invoice_generation.sql

-- Function to generate employer invoices with patient aggregation
CREATE OR REPLACE FUNCTION generate_employer_invoice(
  p_employer_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_due_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days')
)
RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID;
  v_invoice_number TEXT;
  v_total_amount NUMERIC(10,2) := 0;
  v_employer_name TEXT;
  v_line_items JSONB := '[]'::JSONB;
  v_patient_count INT := 0;
BEGIN
  -- Get employer details
  SELECT name INTO v_employer_name
  FROM employers
  WHERE id = p_employer_id;

  IF v_employer_name IS NULL THEN
    RAISE EXCEPTION 'Employer not found';
  END IF;

  -- Generate invoice number
  v_invoice_number := 'INV-' || p_employer_id::TEXT || '-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

  -- Create the invoice
  INSERT INTO invoices (
    invoice_number,
    employer_id,
    issue_date,
    due_date,
    status,
    items,
    total_amount,
    notes
  ) VALUES (
    v_invoice_number,
    p_employer_id,
    CURRENT_DATE,
    p_due_date,
    'pending',
    '[]'::JSONB,
    0,
    'Generated for period: ' || p_start_date || ' to ' || p_end_date
  ) RETURNING id INTO v_invoice_id;

  -- Aggregate charges by patient
  WITH patient_charges AS (
    -- Get all charges for active employer patients in the date range
    SELECT 
      ac.patient_id,
      p.raw_user_meta_data->>'name' as patient_name,
      ep.employee_id,
      ep.department,
      COUNT(DISTINCT ac.appointment_id) as appointment_count,
      SUM(ac.amount) as total_amount,
      ARRAY_AGG(
        JSONB_BUILD_OBJECT(
          'appointment_id', ac.appointment_id,
          'service_date', ac.service_date,
          'description', ac.description,
          'amount', ac.amount,
          'provider_name', pr.raw_user_meta_data->>'name'
        ) ORDER BY ac.service_date
      ) as appointments
    FROM appointment_charges ac
    JOIN employer_patients ep ON ac.patient_id = ep.patient_id
    JOIN auth.users p ON ac.patient_id = p.id
    LEFT JOIN appointments a ON ac.appointment_id = a.id
    LEFT JOIN auth.users pr ON a.provider_id = pr.id
    WHERE ep.employer_id = p_employer_id
      AND ep.is_active = true
      AND ac.service_date BETWEEN p_start_date AND p_end_date
      AND ac.status = 'pending'
    GROUP BY ac.patient_id, p.raw_user_meta_data->>'name', ep.employee_id, ep.department
  )
  -- Build line items and calculate total
  SELECT 
    COUNT(*),
    COALESCE(SUM(total_amount), 0),
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'patient_id', patient_id,
        'patient_name', patient_name,
        'employee_id', employee_id,
        'department', department,
        'appointment_count', appointment_count,
        'amount', total_amount,
        'appointments', appointments
      ) ORDER BY patient_name
    )
  INTO v_patient_count, v_total_amount, v_line_items
  FROM patient_charges;

  -- Update invoice with aggregated data
  UPDATE invoices
  SET 
    items = v_line_items,
    total_amount = v_total_amount,
    metadata = JSONB_BUILD_OBJECT(
      'employer_name', v_employer_name,
      'patient_count', v_patient_count,
      'period_start', p_start_date,
      'period_end', p_end_date,
      'generated_at', NOW()
    )
  WHERE id = v_invoice_id;

  -- Mark the included appointment charges as invoiced
  UPDATE appointment_charges ac
  SET 
    status = 'invoiced',
    invoice_id = v_invoice_id,
    updated_at = NOW()
  FROM employer_patients ep
  WHERE ac.patient_id = ep.patient_id
    AND ep.employer_id = p_employer_id
    AND ep.is_active = true
    AND ac.service_date BETWEEN p_start_date AND p_end_date
    AND ac.status = 'pending';

  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate monthly employer invoices for all employers
CREATE OR REPLACE FUNCTION generate_monthly_employer_invoices(
  p_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
)
RETURNS TABLE(
  employer_id UUID,
  employer_name TEXT,
  invoice_id UUID,
  total_amount NUMERIC,
  patient_count INT
) AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Calculate date range for the month
  v_start_date := DATE_TRUNC('month', p_month);
  v_end_date := (v_start_date + INTERVAL '1 month - 1 day')::DATE;

  -- Generate invoices for all active employers with pending charges
  RETURN QUERY
  WITH employers_with_charges AS (
    SELECT DISTINCT e.id, e.name
    FROM employers e
    JOIN employer_patients ep ON e.id = ep.employer_id
    JOIN appointment_charges ac ON ep.patient_id = ac.patient_id
    WHERE e.is_active = true
      AND ep.is_active = true
      AND ac.status = 'pending'
      AND ac.service_date BETWEEN v_start_date AND v_end_date
  )
  SELECT 
    e.id as employer_id,
    e.name as employer_name,
    generate_employer_invoice(e.id, v_start_date, v_end_date) as invoice_id,
    i.total_amount,
    (i.metadata->>'patient_count')::INT as patient_count
  FROM employers_with_charges e
  JOIN invoices i ON i.id = generate_employer_invoice(e.id, v_start_date, v_end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for employer invoice details with patient breakdown
CREATE OR REPLACE VIEW employer_invoice_details AS
SELECT 
  i.id as invoice_id,
  i.invoice_number,
  i.issue_date,
  i.due_date,
  i.status,
  i.total_amount,
  e.id as employer_id,
  e.name as employer_name,
  e.contact_email,
  i.metadata->>'patient_count' as patient_count,
  i.metadata->>'period_start' as period_start,
  i.metadata->>'period_end' as period_end,
  JSONB_ARRAY_ELEMENTS(i.items) as patient_detail
FROM invoices i
JOIN employers e ON i.employer_id = e.id
WHERE i.employer_id IS NOT NULL;

-- View for patient-level invoice breakdown
CREATE OR REPLACE VIEW employer_invoice_patient_breakdown AS
SELECT 
  invoice_id,
  invoice_number,
  employer_id,
  employer_name,
  patient_detail->>'patient_id' as patient_id,
  patient_detail->>'patient_name' as patient_name,
  patient_detail->>'employee_id' as employee_id,
  patient_detail->>'department' as department,
  (patient_detail->>'appointment_count')::INT as appointment_count,
  (patient_detail->>'amount')::NUMERIC as amount,
  patient_detail->'appointments' as appointments
FROM employer_invoice_details;

-- Function to get employer invoice summary by date range
CREATE OR REPLACE FUNCTION get_employer_invoice_summary(
  p_employer_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  total_invoices INT,
  total_amount NUMERIC,
  paid_amount NUMERIC,
  pending_amount NUMERIC,
  patient_count INT,
  appointment_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT i.id)::INT as total_invoices,
    COALESCE(SUM(i.total_amount), 0) as total_amount,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0) as paid_amount,
    COALESCE(SUM(CASE WHEN i.status = 'pending' THEN i.total_amount ELSE 0 END), 0) as pending_amount,
    COUNT(DISTINCT ac.patient_id)::INT as patient_count,
    COUNT(DISTINCT ac.appointment_id)::INT as appointment_count
  FROM invoices i
  LEFT JOIN appointment_charges ac ON ac.invoice_id = i.id
  WHERE i.employer_id = p_employer_id
    AND i.issue_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointment_charges_invoice_id ON appointment_charges(invoice_id);
CREATE INDEX IF NOT EXISTS idx_appointment_charges_patient_service ON appointment_charges(patient_id, service_date);
CREATE INDEX IF NOT EXISTS idx_invoices_employer_date ON invoices(employer_id, issue_date);

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_employer_invoice TO authenticated;
GRANT EXECUTE ON FUNCTION generate_monthly_employer_invoices TO authenticated;
GRANT EXECUTE ON FUNCTION get_employer_invoice_summary TO authenticated;
GRANT SELECT ON employer_invoice_details TO authenticated;
GRANT SELECT ON employer_invoice_patient_breakdown TO authenticated;

-- Sample usage (commented out)
/*
-- Generate invoice for a specific employer for last month
SELECT generate_employer_invoice(
  'employer-uuid-here',
  DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::DATE
);

-- Generate all monthly invoices
SELECT * FROM generate_monthly_employer_invoices();

-- View employer invoice details
SELECT * FROM employer_invoice_details WHERE employer_id = 'employer-uuid-here';

-- View patient breakdown for an invoice
SELECT * FROM employer_invoice_patient_breakdown WHERE invoice_id = 'invoice-uuid-here';
*/

-- END: 20240127_employer_invoice_generation.sql


-- START: 20240128_create_progress_photos.sql

-- Create progress_photos table
CREATE TABLE IF NOT EXISTS progress_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    week VARCHAR(50) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    weight DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_progress_photos_user_id ON progress_photos(user_id);
CREATE INDEX idx_progress_photos_date ON progress_photos(date DESC);

-- Enable RLS
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own progress photos"
    ON progress_photos
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress photos"
    ON progress_photos
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress photos"
    ON progress_photos
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress photos"
    ON progress_photos
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create storage bucket for progress photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own progress photos"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'progress-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own progress photos"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'progress-photos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own progress photos"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'progress-photos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_progress_photos_updated_at
    BEFORE UPDATE ON progress_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- END: 20240128_create_progress_photos.sql


-- START: 20240128_create_secure_messages.sql

-- Create secure_messages table
CREATE TABLE IF NOT EXISTS public.secure_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_secure_messages_sender_id ON public.secure_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_secure_messages_recipient_id ON public.secure_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_secure_messages_sent_at ON public.secure_messages(sent_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.secure_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can see messages they sent or received
CREATE POLICY "Users can view their own messages" ON public.secure_messages
    FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can insert messages as sender
CREATE POLICY "Users can send messages" ON public.secure_messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Users can update their own sent messages (e.g., for read receipts)
CREATE POLICY "Recipients can mark messages as read" ON public.secure_messages
    FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_secure_messages_updated_at 
    BEFORE UPDATE ON public.secure_messages 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.secure_messages TO authenticated;
GRANT SELECT ON public.secure_messages TO anon;

-- END: 20240128_create_secure_messages.sql


-- START: 20240724_appointments_video_status.sql

-- Add video_url column for storing video conference links
ALTER TABLE appointments ADD COLUMN video_url TEXT;

-- Add status column with new status values
-- Note: This will replace any existing status column
ALTER TABLE appointments ADD COLUMN status TEXT DEFAULT 'pending';

-- Update any existing appointments with appropriate status
-- (Optional - uncomment if you have existing data to migrate)
-- UPDATE appointments 
-- SET status = CASE 
--   WHEN status = 'confirmed' THEN 'pending'
--   WHEN status = 'completed' THEN 'complete'
--   WHEN status = 'cancelled' THEN 'cancelled'
--   ELSE 'pending'
-- END
-- WHERE status IS NOT NULL;

-- Add check constraint to ensure valid status values
ALTER TABLE appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending', 'in_progress', 'complete', 'cancelled'));

-- Add index on status for performance
CREATE INDEX idx_appointments_status ON appointments(status);

-- Add index on video_url for filtering telemedicine appointments
CREATE INDEX idx_appointments_video_url ON appointments(video_url) WHERE video_url IS NOT NULL;

-- END: 20240724_appointments_video_status.sql


-- START: 20240725_appointment_transcripts.sql

-- Create appointment_transcripts table for storing conversation transcripts
CREATE TABLE appointment_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  speaker TEXT CHECK (speaker IN ('patient', 'provider', 'system')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for appointment lookups
CREATE INDEX idx_appointment_transcripts_appointment_id ON appointment_transcripts(appointment_id);
CREATE INDEX idx_appointment_transcripts_created_at ON appointment_transcripts(created_at);

-- Add column to appointments table to track if transcript has been summarized
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS transcript_summarized BOOLEAN DEFAULT FALSE;

-- Add comments
COMMENT ON TABLE appointment_transcripts IS 'Stores conversation transcripts from appointments';
COMMENT ON COLUMN appointment_transcripts.speaker IS 'Who is speaking: patient, provider, or system';
COMMENT ON COLUMN appointment_transcripts.text IS 'The actual text spoken or system message';
COMMENT ON COLUMN appointments.transcript_summarized IS 'Whether this appointment transcript has been processed into a SOAP note';

-- END: 20240725_appointment_transcripts.sql


-- START: 20240725_appointment_triggers.sql

-- Create function to call edge function when appointment is completed
CREATE OR REPLACE FUNCTION trigger_soap_generation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if status changed to 'complete' and transcript not already summarized
  IF NEW.status = 'complete' AND OLD.status != 'complete' AND NEW.transcript_summarized = false THEN
    -- Insert a job record to process this appointment
    -- Note: In production, you'd use pg_cron or a job queue
    -- For now, we'll rely on the cron job to pick it up
    PERFORM pg_notify('appointment_completed', NEW.id::text);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on appointments table
DROP TRIGGER IF EXISTS appointment_status_trigger ON appointments;
CREATE TRIGGER appointment_status_trigger
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_soap_generation();

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_appointments_status_summarized 
  ON appointments(status, transcript_summarized) 
  WHERE status = 'complete' AND transcript_summarized = false;

-- Comment on the trigger
COMMENT ON TRIGGER appointment_status_trigger ON appointments IS 'Triggers SOAP note generation when appointment is marked complete';

-- END: 20240725_appointment_triggers.sql


-- START: 20240725_employers_branding.sql

-- Add branding columns to employers table
ALTER TABLE employers ADD COLUMN favicon_url TEXT;
ALTER TABLE employers ADD COLUMN logo_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN employers.favicon_url IS 'URL to the employer''s favicon image (typically 32x32 or 64x64)';
COMMENT ON COLUMN employers.logo_url IS 'URL to the employer''s full logo image for branding';

-- Example update for existing employers (optional)
-- UPDATE employers 
-- SET 
--   favicon_url = 'https://example.com/favicon.ico',
--   logo_url = 'https://example.com/logo.png'
-- WHERE name = 'Example Employer';

-- END: 20240725_employers_branding.sql


-- START: 20240725_lab_results_reviewed.sql

-- Add reviewed column to lab_results table
ALTER TABLE lab_results 
ADD COLUMN reviewed BOOLEAN DEFAULT FALSE;

-- Add index for efficient queries
CREATE INDEX idx_lab_results_reviewed ON lab_results(reviewed) WHERE reviewed = FALSE;

-- Add comment
COMMENT ON COLUMN lab_results.reviewed IS 'Whether the lab results have been reviewed by a provider';

-- END: 20240725_lab_results_reviewed.sql


-- START: 20240725_lab_results.sql

-- Create lab_results table for storing patient lab test results
CREATE TABLE lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  panel TEXT NOT NULL,
  date DATE NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient queries
CREATE INDEX idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX idx_lab_results_date ON lab_results(date DESC);
CREATE INDEX idx_lab_results_panel ON lab_results(panel);
CREATE INDEX idx_lab_results_patient_date ON lab_results(patient_id, date DESC);

-- Add GIN index for JSONB queries
CREATE INDEX idx_lab_results_results ON lab_results USING GIN (results);

-- Add comments
COMMENT ON TABLE lab_results IS 'Stores patient laboratory test results';
COMMENT ON COLUMN lab_results.panel IS 'Type of lab panel (e.g., Metabolic Panel, CBC, Lipid Panel)';
COMMENT ON COLUMN lab_results.results IS 'JSONB containing test results with test names as keys and values/ranges as values';

-- Example results format:
-- {
--   "glucose": { "value": 95, "unit": "mg/dL", "range": "70-100", "flag": "normal" },
--   "sodium": { "value": 140, "unit": "mEq/L", "range": "136-145", "flag": "normal" },
--   "potassium": { "value": 4.0, "unit": "mEq/L", "range": "3.5-5.0", "flag": "normal" }
-- }

-- END: 20240725_lab_results.sql


-- START: 20240725_meditation_audio.sql

-- Add audio_url column to meditation_logs
ALTER TABLE meditation_logs ADD COLUMN audio_url TEXT;

-- Create meditation_audio table for pre-defined meditation tracks
CREATE TABLE meditation_audio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'calm', 'sleep', 'focus', 'anxiety', 'breathing'
  name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for type lookups
CREATE INDEX idx_meditation_audio_type ON meditation_audio(type);

-- Insert some default audio tracks (update URLs after uploading to storage)
INSERT INTO meditation_audio (type, name, audio_url, duration_seconds, description) VALUES
  ('focus', 'Focus Enhancement 1', '/meditation-audio/focus-enhancement-1.mp3', 300, 'Enhance concentration and mental clarity'),
  ('calm', 'Peaceful Mind', '/meditation-audio/peaceful-mind.mp3', 600, 'Find inner peace and tranquility'),
  ('sleep', 'Deep Sleep Journey', '/meditation-audio/deep-sleep.mp3', 900, 'Drift into restful sleep'),
  ('anxiety', 'Anxiety Relief', '/meditation-audio/anxiety-relief.mp3', 420, 'Release tension and worry'),
  ('breathing', 'Breath Awareness', '/meditation-audio/breath-awareness.mp3', 180, 'Guided breathing exercise');

-- Add comments
COMMENT ON TABLE meditation_audio IS 'Pre-defined meditation audio tracks';
COMMENT ON COLUMN meditation_audio.audio_url IS 'URL to audio file in Supabase storage';
COMMENT ON COLUMN meditation_logs.audio_url IS 'URL to audio file used for this specific session';

-- END: 20240725_meditation_audio.sql


-- START: 20240725_meditation_logs_extended.sql

-- Add additional columns to meditation_logs for AI-generated meditations
ALTER TABLE meditation_logs
ADD COLUMN topic TEXT,
ADD COLUMN voice TEXT,
ADD COLUMN model TEXT,
ADD COLUMN include_music BOOLEAN DEFAULT false;

-- Add comments for clarity
COMMENT ON COLUMN meditation_logs.topic IS 'Custom topic for AI-generated meditation sessions';
COMMENT ON COLUMN meditation_logs.voice IS 'Voice selection for text-to-speech (e.g., alloy, echo, fable, onyx, nova, shimmer)';
COMMENT ON COLUMN meditation_logs.model IS 'AI model used to generate the meditation script';
COMMENT ON COLUMN meditation_logs.include_music IS 'Whether background music was included in the session';

-- END: 20240725_meditation_logs_extended.sql


-- START: 20240725_meditation_logs.sql

-- Create meditation_logs table
CREATE TABLE meditation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT, -- 'calm', 'sleep', 'focus', 'anxiety', 'breathing', etc.
  duration_minutes INT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX idx_meditation_logs_user_id ON meditation_logs(user_id);
CREATE INDEX idx_meditation_logs_started_at ON meditation_logs(started_at DESC);

-- Add RLS policies
ALTER TABLE meditation_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own meditation logs
CREATE POLICY "Users can view own meditation logs" ON meditation_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own meditation logs
CREATE POLICY "Users can insert own meditation logs" ON meditation_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own meditation logs
CREATE POLICY "Users can update own meditation logs" ON meditation_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE meditation_logs IS 'Tracks user meditation sessions';
COMMENT ON COLUMN meditation_logs.type IS 'Type of meditation: calm, sleep, focus, anxiety, breathing, etc.';
COMMENT ON COLUMN meditation_logs.duration_minutes IS 'Duration of the meditation session in minutes';
COMMENT ON COLUMN meditation_logs.started_at IS 'When the meditation session started';
COMMENT ON COLUMN meditation_logs.completed_at IS 'When the meditation session was completed';

-- END: 20240725_meditation_logs.sql


-- START: 20240725_messaging_system.sql

-- Create message threads table
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, provider_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  seen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient queries
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_seen ON messages(recipient_id, seen) WHERE seen = FALSE;

CREATE INDEX idx_message_threads_patient_id ON message_threads(patient_id);
CREATE INDEX idx_message_threads_provider_id ON message_threads(provider_id);

-- Add comments
COMMENT ON TABLE message_threads IS 'Conversation threads between patients and providers';
COMMENT ON TABLE messages IS 'Individual messages within conversation threads';
COMMENT ON COLUMN messages.seen IS 'Whether the recipient has read the message';

-- END: 20240725_messaging_system.sql


-- START: 20240725_patient_risk_flags.sql

-- Create patient_risk_flags table for tracking patient health risks and alerts
CREATE TABLE patient_risk_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  reason TEXT,
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- Add indexes for efficient queries
CREATE INDEX idx_patient_risk_flags_patient_id ON patient_risk_flags(patient_id);
CREATE INDEX idx_patient_risk_flags_resolved ON patient_risk_flags(resolved);
CREATE INDEX idx_patient_risk_flags_flagged_at ON patient_risk_flags(flagged_at DESC);
CREATE INDEX idx_patient_risk_flags_patient_unresolved ON patient_risk_flags(patient_id, resolved) WHERE resolved = FALSE;

-- Add comments
COMMENT ON TABLE patient_risk_flags IS 'Tracks health risk flags and alerts for patients';
COMMENT ON COLUMN patient_risk_flags.label IS 'Short label for the risk (e.g., High Blood Pressure, Diabetes Risk)';
COMMENT ON COLUMN patient_risk_flags.reason IS 'Detailed reason or criteria that triggered this flag';
COMMENT ON COLUMN patient_risk_flags.resolved IS 'Whether this risk flag has been addressed or resolved';

-- Example risk flags:
-- label: 'High Blood Pressure'
-- reason: 'BP reading 145/95 on 2024-07-25'
--
-- label: 'Missed Medications'  
-- reason: 'Patient reported not taking prescribed medications for 3 days'
--
-- label: 'Abnormal Lab Result'
-- reason: 'Glucose 250 mg/dL (normal: 70-99)'

-- END: 20240725_patient_risk_flags.sql


-- START: 20240726_patient_shares.sql

create table patient_shares (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,        -- original patient
  shared_with_id uuid,  -- the viewer
  access_labs boolean default true,
  access_meds boolean default true,
  access_appointments boolean default true,
  access_uploads boolean default true,
  access_timeline boolean default true,
  created_at timestamptz default now(),
  revoked boolean default false
);

-- END: 20240726_patient_shares.sql


-- START: 20240727_ai_logs.sql

create table ai_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  role text,
  model text, -- Gemini, ChatGPT, etc.
  voice_used text,
  action text, -- e.g. 'Generate SOAP', 'Meditation', 'Search'
  input text,
  output text,
  success boolean default true,
  created_at timestamptz default now()
);

-- Add index for querying by user
create index idx_ai_logs_user_id on ai_logs(user_id);

-- Add index for querying by date
create index idx_ai_logs_created_at on ai_logs(created_at);

-- Add index for querying by action
create index idx_ai_logs_action on ai_logs(action);

-- RLS policies
alter table ai_logs enable row level security;

-- Admins can view all logs
create policy "Admins can view all AI logs"
  on ai_logs for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Users can view their own logs
create policy "Users can view own AI logs"
  on ai_logs for select
  using (user_id = auth.uid());

-- System can insert logs (for edge functions)
create policy "System can insert AI logs"
  on ai_logs for insert
  with check (true);

-- END: 20240727_ai_logs.sql


-- START: 20240727_employer_branding.sql

alter table employers
add column logo_url text,
add column favicon_url text,
add column primary_color text default '#3B82F6',
add column voice_profile text default 'Rachel',
add column tagline text;

-- END: 20240727_employer_branding.sql


-- START: 20240728_employer_subdomain.sql

-- Add subdomain field to employers table
alter table employers
add column subdomain text unique;

-- Add index for subdomain lookups
create index idx_employers_subdomain on employers(subdomain);

-- Example data
-- update employers set subdomain = 'acme' where name = 'Acme Corporation';
-- update employers set subdomain = 'contoso' where name = 'Contoso Ltd';

-- END: 20240728_employer_subdomain.sql


-- START: 20240728_patient_media.sql

create table patient_media (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references users(id),
  type text check (type in ('photo', 'video')),
  file_url text not null,
  ai_summary text,
  reviewed_by uuid references users(id),
  created_at timestamptz default now()
);

-- Add indexes
create index idx_patient_media_patient_id on patient_media(patient_id);
create index idx_patient_media_created_at on patient_media(created_at);
create index idx_patient_media_type on patient_media(type);

-- RLS policies
alter table patient_media enable row level security;

-- Patients can view their own media
create policy "Patients can view own media"
  on patient_media for select
  using (patient_id = auth.uid());

-- Patients can upload their own media
create policy "Patients can upload media"
  on patient_media for insert
  with check (patient_id = auth.uid());

-- Providers can view patient media
create policy "Providers can view patient media"
  on patient_media for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'provider'
    )
  );

-- Providers can update media (for ai_summary and reviewed_by)
create policy "Providers can update media"
  on patient_media for update
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'provider'
    )
  );

-- Shared access through patient_shares
create policy "Shared users can view media"
  on patient_media for select
  using (
    exists (
      select 1 from patient_shares
      where patient_shares.owner_id = patient_media.patient_id
      and patient_shares.shared_with_id = auth.uid()
      and patient_shares.revoked = false
      and patient_shares.access_uploads = true
    )
  );

-- END: 20240728_patient_media.sql


-- START: 20240728_wearable_logs.sql

create table wearable_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references users(id),
  source text check (source in ('oura', 'fitbit', 'apple')),
  date date not null,
  steps int,
  heart_rate int,
  hrv int,
  sleep_hours numeric(3,1),
  readiness_score int,
  data jsonb,
  created_at timestamptz default now()
);

-- Add indexes
create index idx_wearable_logs_patient_id on wearable_logs(patient_id);
create index idx_wearable_logs_date on wearable_logs(date);
create index idx_wearable_logs_source on wearable_logs(source);
create index idx_wearable_logs_patient_date on wearable_logs(patient_id, date);

-- Unique constraint to prevent duplicate entries
create unique index idx_wearable_logs_unique on wearable_logs(patient_id, source, date);

-- RLS policies
alter table wearable_logs enable row level security;

-- Patients can view their own wearable data
create policy "Patients can view own wearable data"
  on wearable_logs for select
  using (patient_id = auth.uid());

-- Patients can insert their own wearable data
create policy "Patients can insert wearable data"
  on wearable_logs for insert
  with check (patient_id = auth.uid());

-- Patients can update their own wearable data
create policy "Patients can update wearable data"
  on wearable_logs for update
  using (patient_id = auth.uid());

-- Providers can view patient wearable data
create policy "Providers can view patient wearable data"
  on wearable_logs for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'provider'
    )
  );

-- Shared access through patient_shares
create policy "Shared users can view wearable data"
  on wearable_logs for select
  using (
    exists (
      select 1 from patient_shares
      where patient_shares.owner_id = wearable_logs.patient_id
      and patient_shares.shared_with_id = auth.uid()
      and patient_shares.revoked = false
    )
  );

-- END: 20240728_wearable_logs.sql


-- START: 20240729_employer_invoice_customization.sql

alter table employers
add column invoice_header text,
add column invoice_footer text;

-- END: 20240729_employer_invoice_customization.sql


-- START: 20240729_patient_media.sql

create table patient_media (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references users(id),
  type text check (type in ('photo', 'video')),
  file_url text not null,
  ai_summary text,
  reviewed_by uuid references users(id),
  created_at timestamptz default now()
);

-- Add indexes
create index idx_patient_media_patient_id on patient_media(patient_id);
create index idx_patient_media_created_at on patient_media(created_at);
create index idx_patient_media_type on patient_media(type);

-- RLS policies
alter table patient_media enable row level security;

-- Patients can view their own media
create policy "Patients can view own media"
  on patient_media for select
  using (patient_id = auth.uid());

-- Patients can upload their own media
create policy "Patients can upload media"
  on patient_media for insert
  with check (patient_id = auth.uid());

-- Providers can view patient media
create policy "Providers can view patient media"
  on patient_media for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'provider'
    )
  );

-- Providers can update media (for ai_summary and reviewed_by)
create policy "Providers can update media"
  on patient_media for update
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'provider'
    )
  );

-- Shared access through patient_shares
create policy "Shared users can view media"
  on patient_media for select
  using (
    exists (
      select 1 from patient_shares
      where patient_shares.owner_id = patient_media.patient_id
      and patient_shares.shared_with_id = auth.uid()
      and patient_shares.revoked = false
      and patient_shares.access_uploads = true
    )
  );

-- END: 20240729_patient_media.sql


-- START: 20240729_weekly_goals.sql

create table weekly_goals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references users(id),
  week_start date not null,
  focus_area text check (focus_area in ('hydration', 'protein', 'sleep', 'steps', 'exercise', 'meditation', 'calories', 'carbs', 'fiber')),
  goal_description text not null,
  target_value numeric not null,
  current_value numeric default 0,
  unit text not null,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Add indexes
create index idx_weekly_goals_patient_id on weekly_goals(patient_id);
create index idx_weekly_goals_week_start on weekly_goals(week_start);
create index idx_weekly_goals_patient_week on weekly_goals(patient_id, week_start);

-- Unique constraint to prevent duplicate goals per focus area per week
create unique index idx_weekly_goals_unique on weekly_goals(patient_id, week_start, focus_area);

-- RLS policies
alter table weekly_goals enable row level security;

-- Patients can view their own goals
create policy "Patients can view own goals"
  on weekly_goals for select
  using (patient_id = auth.uid());

-- Patients can create their own goals
create policy "Patients can create goals"
  on weekly_goals for insert
  with check (patient_id = auth.uid());

-- Patients can update their own goals
create policy "Patients can update goals"
  on weekly_goals for update
  using (patient_id = auth.uid());

-- Providers can view patient goals
create policy "Providers can view patient goals"
  on weekly_goals for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'provider'
    )
  );

-- Shared access through patient_shares
create policy "Shared users can view goals"
  on weekly_goals for select
  using (
    exists (
      select 1 from patient_shares
      where patient_shares.owner_id = weekly_goals.patient_id
      and patient_shares.shared_with_id = auth.uid()
      and patient_shares.revoked = false
    )
  );

-- END: 20240729_weekly_goals.sql


-- START: 20240730_audit_logs.sql

-- Create audit logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Add comments
COMMENT ON TABLE audit_logs IS 'Audit trail for user actions';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (e.g., invoice_pdf_download, invoice_pdf_generate)';
COMMENT ON COLUMN audit_logs.target IS 'ID of the resource being acted upon';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context about the action';

-- Example audit log actions:
-- invoice_pdf_download - User downloaded/viewed an invoice PDF
-- invoice_pdf_generate - User generated a new invoice PDF
-- invoice_created - New invoice was created
-- invoice_updated - Invoice was modified
-- invoice_sent - Invoice was sent to employer

-- END: 20240730_audit_logs.sql


-- START: 20240730_grocery_history.sql

create table grocery_history (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references users(id),
  source_plan text,
  list jsonb not null,
  notes text,
  created_at timestamptz default now()
);

-- Add indexes
create index idx_grocery_history_patient_id on grocery_history(patient_id);
create index idx_grocery_history_created_at on grocery_history(created_at);

-- RLS policies
alter table grocery_history enable row level security;

-- Patients can view their own grocery history
create policy "Patients can view own grocery history"
  on grocery_history for select
  using (patient_id = auth.uid());

-- Patients can create their own grocery history
create policy "Patients can create grocery history"
  on grocery_history for insert
  with check (patient_id = auth.uid());

-- Providers can view patient grocery history
create policy "Providers can view patient grocery history"
  on grocery_history for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'provider'
    )
  );

-- END: 20240730_grocery_history.sql


-- START: 20240730_weekly_goals.sql

create table weekly_goals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid,
  week_start date,
  focus_area text, -- "hydration", "protein", "sleep", etc.
  goal_description text,
  target_value numeric,
  current_value numeric default 0,
  unit text, -- "oz", "g", "hrs"
  completed boolean default false,
  created_at timestamptz default now()
);

-- END: 20240730_weekly_goals.sql


-- START: 20240731_employer_notification_sender.sql

alter table employers add column notification_sender_name text default 'Purity Health';

-- END: 20240731_employer_notification_sender.sql


-- START: 20250124_add_onboarding_status_to_users.sql

-- Add onboarding_status column to users table
ALTER TABLE users ADD COLUMN onboarding_status text DEFAULT 'not_started';

-- Add check constraint for valid onboarding statuses
ALTER TABLE users ADD CONSTRAINT valid_onboarding_status 
  CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed'));

-- END: 20250124_add_onboarding_status_to_users.sql


-- START: 20250124_add_user_profile_fields.sql

-- Add additional profile fields to users table
ALTER TABLE users ADD COLUMN dob date;
ALTER TABLE users ADD COLUMN phone text;
ALTER TABLE users ADD COLUMN assistant_tone text DEFAULT 'professional' CHECK (assistant_tone IN ('professional', 'friendly', 'casual', 'concise'));
ALTER TABLE users ADD COLUMN notifications_enabled boolean DEFAULT true;

-- Add indexes for new fields
CREATE INDEX idx_users_dob ON users(dob);
CREATE INDEX idx_users_notifications_enabled ON users(notifications_enabled);

-- Add comments
COMMENT ON COLUMN users.dob IS 'Date of birth';
COMMENT ON COLUMN users.phone IS 'Phone number for notifications';
COMMENT ON COLUMN users.assistant_tone IS 'Preferred AI assistant communication tone';
COMMENT ON COLUMN users.notifications_enabled IS 'Whether user wants to receive notifications';

-- END: 20250124_add_user_profile_fields.sql


-- START: 20250124_create_drug_names_table.sql

-- Create drug_names lookup table
CREATE TABLE drug_names (
  name text PRIMARY KEY,
  generic_name text,
  drug_class text,
  common_uses text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better search performance
CREATE INDEX idx_drug_names_generic ON drug_names(generic_name);
CREATE INDEX idx_drug_names_class ON drug_names(drug_class);

-- Enable RLS
ALTER TABLE drug_names ENABLE ROW LEVEL SECURITY;

-- Everyone can read drug names (public reference data)
CREATE POLICY "Public read access to drug names" ON drug_names
  FOR SELECT USING (true);

-- Only admins can manage drug names
CREATE POLICY "Admins can insert drug names" ON drug_names
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update drug names" ON drug_names
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete drug names" ON drug_names
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Insert some common medications
INSERT INTO drug_names (name, generic_name, drug_class, common_uses) VALUES
  ('Tylenol', 'Acetaminophen', 'Analgesic', 'Pain relief, fever reduction'),
  ('Advil', 'Ibuprofen', 'NSAID', 'Pain relief, inflammation reduction'),
  ('Aspirin', 'Acetylsalicylic acid', 'NSAID', 'Pain relief, blood thinner'),
  ('Amoxicillin', 'Amoxicillin', 'Antibiotic', 'Bacterial infections'),
  ('Lisinopril', 'Lisinopril', 'ACE inhibitor', 'High blood pressure'),
  ('Metformin', 'Metformin', 'Antidiabetic', 'Type 2 diabetes'),
  ('Lipitor', 'Atorvastatin', 'Statin', 'High cholesterol'),
  ('Zoloft', 'Sertraline', 'SSRI', 'Depression, anxiety'),
  ('Synthroid', 'Levothyroxine', 'Thyroid hormone', 'Hypothyroidism'),
  ('Ventolin', 'Albuterol', 'Bronchodilator', 'Asthma, COPD')
ON CONFLICT (name) DO NOTHING;

-- Add comment
COMMENT ON TABLE drug_names IS 'Reference table for medication names and information';

-- END: 20250124_create_drug_names_table.sql


-- START: 20250124_create_family_members_read_policy.sql

-- Create RLS policy: Only owner can read their family
CREATE POLICY "Only owner can read their family" ON family_members
FOR SELECT USING (auth.uid() = account_holder_id);

-- END: 20250124_create_family_members_read_policy.sql


-- START: 20250124_create_invoices_table.sql

-- Create invoices table
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES employers(id) ON DELETE CASCADE,
  month text NOT NULL,
  total_amount decimal(10, 2) NOT NULL CHECK (total_amount >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  paid_at timestamptz,
  due_date date
);

-- Create indexes
CREATE INDEX idx_invoices_employer_id ON invoices(employer_id);
CREATE INDEX idx_invoices_month ON invoices(month);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Employers can view their own invoices
CREATE POLICY "Employers can view own invoices" ON invoices
  FOR SELECT USING (
    employer_id IN (
      SELECT id FROM employers WHERE owner_id = auth.uid()
    )
  );

-- Admins can view all invoices
CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admins can create invoices
CREATE POLICY "Admins can create invoices" ON invoices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admins can update invoices
CREATE POLICY "Admins can update invoices" ON invoices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON invoices 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE invoices IS 'Monthly invoices for employer billing';
COMMENT ON COLUMN invoices.month IS 'Format: YYYY-MM';
COMMENT ON COLUMN invoices.status IS 'Invoice payment status';
COMMENT ON COLUMN invoices.pdf_url IS 'URL to generated PDF invoice';

-- END: 20250124_create_invoices_table.sql


-- START: 20250124_create_medications_table.sql

-- Create medications table
CREATE TABLE medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  strength text,
  dosage text,
  frequency text,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  prescriber text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_medications_patient_id ON medications(patient_id);
CREATE INDEX idx_medications_is_active ON medications(is_active);
CREATE INDEX idx_medications_created_at ON medications(created_at DESC);

-- Enable RLS
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Patients can view their own medications
CREATE POLICY "Patients can view own medications" ON medications
  FOR SELECT USING (auth.uid() = patient_id);

-- Patients can add their own medications
CREATE POLICY "Patients can insert own medications" ON medications
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Patients can update their own medications
CREATE POLICY "Patients can update own medications" ON medications
  FOR UPDATE USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Patients can delete their own medications
CREATE POLICY "Patients can delete own medications" ON medications
  FOR DELETE USING (auth.uid() = patient_id);

-- Providers can view patient medications (if we have a provider access system)
CREATE POLICY "Providers can view patient medications" ON medications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'provider'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_medications_updated_at 
  BEFORE UPDATE ON medications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE medications IS 'Patient medication records';
COMMENT ON COLUMN medications.strength IS 'Medication strength (e.g., 10mg, 500mg)';
COMMENT ON COLUMN medications.dosage IS 'Dosage instructions (e.g., 1 tablet, 2 capsules)';
COMMENT ON COLUMN medications.frequency IS 'How often to take (e.g., twice daily, as needed)';

-- END: 20250124_create_medications_table.sql


-- START: 20250124_create_meditation_logs_table.sql

-- Create meditation_logs table to track user meditation sessions
CREATE TABLE meditation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  duration_minutes int NOT NULL CHECK (duration_minutes > 0),
  created_at timestamptz DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_meditation_logs_user_id ON meditation_logs(user_id);
CREATE INDEX idx_meditation_logs_created_at ON meditation_logs(created_at DESC);

-- Enable RLS
ALTER TABLE meditation_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own meditation logs
CREATE POLICY "Users can view own meditation logs" ON meditation_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own meditation logs
CREATE POLICY "Users can insert own meditation logs" ON meditation_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add check constraint for valid meditation types
ALTER TABLE meditation_logs ADD CONSTRAINT valid_meditation_type 
  CHECK (type IN ('grounding', 'calm', 'sleep', 'ambient'));

-- END: 20250124_create_meditation_logs_table.sql


-- START: 20250124_create_users_table.sql

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES employers(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('patient', 'provider', 'owner', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Create indexes
CREATE INDEX idx_users_employer_id ON users(employer_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Employers can view their employees
CREATE POLICY "Employers can view their employees" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employers e 
      WHERE e.owner_id = auth.uid() 
      AND e.id = users.employer_id
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- END: 20250124_create_users_table.sql


-- START: 20250125_food_log_photo_analysis.sql

-- Add photo analysis columns to food_log table if they don't exist
ALTER TABLE food_log 
ADD COLUMN IF NOT EXISTS meal_type text,
ADD COLUMN IF NOT EXISTS total_fiber numeric,
ADD COLUMN IF NOT EXISTS health_score integer CHECK (health_score >= 1 AND health_score <= 10),
ADD COLUMN IF NOT EXISTS photo_analysis jsonb,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_food_log_patient_date ON food_log(patient_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_food_log_meal_type ON food_log(meal_type);

-- Create a view for daily nutrition summary
CREATE OR REPLACE VIEW daily_nutrition_summary AS
SELECT 
  patient_id,
  date::date as date,
  COUNT(*) as meal_count,
  SUM(total_calories) as total_calories,
  SUM(total_protein) as total_protein,
  SUM(total_carbs) as total_carbs,
  SUM(total_fat) as total_fat,
  SUM(total_fiber) as total_fiber,
  SUM(total_water_oz) as total_water,
  AVG(health_score) as avg_health_score
FROM food_log
GROUP BY patient_id, date::date;

-- Create a function to get weekly macro trends
CREATE OR REPLACE FUNCTION get_weekly_macro_trends(p_patient_id uuid)
RETURNS TABLE(
  date date,
  protein numeric,
  carbs numeric,
  fat numeric,
  fiber numeric,
  calories numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fl.date::date,
    COALESCE(SUM(fl.total_protein), 0) as protein,
    COALESCE(SUM(fl.total_carbs), 0) as carbs,
    COALESCE(SUM(fl.total_fat), 0) as fat,
    COALESCE(SUM(fl.total_fiber), 0) as fiber,
    COALESCE(SUM(fl.total_calories), 0) as calories
  FROM food_log fl
  WHERE fl.patient_id = p_patient_id
    AND fl.date >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY fl.date::date
  ORDER BY fl.date::date;
END;
$$ LANGUAGE plpgsql;

-- RLS policies for food_log
ALTER TABLE food_log ENABLE ROW LEVEL SECURITY;

-- Patients can view and insert their own food logs
CREATE POLICY "Patients can view own food logs" ON food_log
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own food logs" ON food_log
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own food logs" ON food_log
  FOR UPDATE USING (auth.uid() = patient_id);

CREATE POLICY "Patients can delete own food logs" ON food_log
  FOR DELETE USING (auth.uid() = patient_id);

-- Providers can view patient food logs (assuming provider_patients relationship exists)
CREATE POLICY "Providers can view patient food logs" ON food_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM provider_patients pp
      WHERE pp.patient_id = food_log.patient_id
        AND pp.provider_id = auth.uid()
    )
  );

-- END: 20250125_food_log_photo_analysis.sql


-- START: 20250728184242_create_ai_conversations_table.sql

-- Create ai_conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  output TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);

-- Enable RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own conversations
CREATE POLICY "Users can view own conversations" ON ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own conversations
CREATE POLICY "Users can create own conversations" ON ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all conversations
CREATE POLICY "Admin can view all conversations" ON ai_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'owner')
    )
  );

-- Create a view with user details
CREATE OR REPLACE VIEW ai_conversations_with_users AS
SELECT 
  c.*,
  u.email as user_email,
  u.raw_user_meta_data->>'full_name' as user_name,
  u.raw_user_meta_data->>'role' as user_role
FROM ai_conversations c
LEFT JOIN auth.users u ON c.user_id = u.id
ORDER BY c.created_at DESC;

-- Grant access to the view
GRANT SELECT ON ai_conversations_with_users TO authenticated;

-- Sample data
INSERT INTO ai_conversations (user_id, input, output) VALUES
  (NULL, 'What are the symptoms of diabetes?', 'Common symptoms of diabetes include increased thirst, frequent urination, extreme fatigue, blurred vision, slow-healing sores, and unexplained weight loss. Type 2 diabetes may develop slowly with mild symptoms.'),
  (NULL, 'How do I schedule an appointment?', 'To schedule an appointment, you can: 1) Call our office at (555) 123-4567, 2) Use our online portal at patient.example.com, or 3) Ask me to help you find the next available slot with your preferred provider.'),
  (NULL, 'What is my deductible?', 'Based on your Glow Tech health plan, your annual deductible is $1,500 for individual coverage. You have currently met $750 of your deductible this year. Your out-of-pocket maximum is $5,000.'),
  (NULL, 'Show me my recent lab results', 'Your recent lab results from July 15, 2025 show: Glucose: 95 mg/dL (normal), Total Cholesterol: 185 mg/dL (desirable), Blood Pressure: 118/76 (normal). All values are within healthy ranges.');

-- END: 20250728184242_create_ai_conversations_table.sql


-- START: 20250728184242_create_ai_logs_table.sql

-- Create ai_logs table for tracking AI assistant interactions
CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  action TEXT NOT NULL, -- 'query', 'voice_transcription', 'symptom_check', etc.
  model TEXT, -- 'gpt-4', 'claude-3', 'gemini-pro', etc.
  input TEXT,
  output TEXT,
  tokens_used INTEGER,
  duration_ms INTEGER,
  employer_id UUID REFERENCES employers(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_ai_logs_user_id ON ai_logs(user_id);
CREATE INDEX idx_ai_logs_employer_id ON ai_logs(employer_id);
CREATE INDEX idx_ai_logs_created_at ON ai_logs(created_at DESC);
CREATE INDEX idx_ai_logs_action ON ai_logs(action);
CREATE INDEX idx_ai_logs_model ON ai_logs(model);

-- Enable RLS
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own AI logs
CREATE POLICY "Users can view own AI logs" ON ai_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Admins and owners can view all AI logs
CREATE POLICY "Admin can view all AI logs" ON ai_logs
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'owner')
  );

-- System can insert AI logs
CREATE POLICY "System can insert AI logs" ON ai_logs
  FOR INSERT WITH CHECK (true);

-- Create function to log AI interactions
CREATE OR REPLACE FUNCTION log_ai_interaction(
  p_action TEXT,
  p_model TEXT DEFAULT NULL,
  p_input TEXT DEFAULT NULL,
  p_output TEXT DEFAULT NULL,
  p_tokens INTEGER DEFAULT NULL,
  p_duration INTEGER DEFAULT NULL,
  p_employer_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_user_data RECORD;
BEGIN
  -- Get user data
  SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name
  INTO v_user_data
  FROM auth.users
  WHERE id = auth.uid();

  -- Insert log
  INSERT INTO ai_logs (
    user_id,
    user_email,
    user_name,
    action,
    model,
    input,
    output,
    tokens_used,
    duration_ms,
    employer_id,
    metadata
  ) VALUES (
    auth.uid(),
    v_user_data.email,
    v_user_data.full_name,
    p_action,
    p_model,
    p_input,
    p_output,
    p_tokens,
    p_duration,
    p_employer_id,
    p_metadata
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for easy access
CREATE OR REPLACE VIEW ai_logs_summary AS
SELECT 
  al.*,
  e.name as employer_name,
  CASE 
    WHEN LENGTH(al.input) > 100 THEN SUBSTRING(al.input, 1, 97) || '...'
    ELSE al.input
  END as input_preview,
  CASE 
    WHEN LENGTH(al.output) > 100 THEN SUBSTRING(al.output, 1, 97) || '...'
    ELSE al.output
  END as output_preview
FROM ai_logs al
LEFT JOIN employers e ON al.employer_id = e.id
ORDER BY al.created_at DESC;

-- Grant access to the view
GRANT SELECT ON ai_logs_summary TO authenticated;

-- Sample data
INSERT INTO ai_logs (user_email, user_name, action, model, input, output, tokens_used, duration_ms) VALUES
  ('leo@patient.com', 'Leo Chavez', 'query', 'gpt-4', 'What are my lab results?', 'Your recent lab results show: Triglycerides: 285 mg/dL (elevated), HDL: 38 mg/dL (low), LDL: 142 mg/dL (borderline high). I recommend discussing these results with your doctor.', 156, 2340),
  ('ian@owner.com', 'Ian Rakow', 'query', 'claude-3', 'Show all invoices for July', 'Here are your July invoices: Glow Tech: $14,200 (paid), Horizon Labs: $18,500 (pending), Sunset Medical: $8,300 (paid). Total: $41,000', 89, 1876),
  ('rivas@provider.com', 'Dr. Rivas', 'voice_transcription', 'whisper', 'Patient presents with chronic headaches lasting 3 weeks', NULL, NULL, 4500),
  ('leo@patient.com', 'Leo Chavez', 'symptom_check', 'gemini-pro', 'Headache, dizziness, blurred vision', 'Based on your symptoms, possible causes include: 1) Migraine - characterized by severe headaches with visual disturbances, 2) Tension headaches - often caused by stress, 3) High blood pressure - can cause these symptoms. Please consult a healthcare provider promptly.', 201, 3200);

-- END: 20250728184242_create_ai_logs_table.sql


-- START: 20250728184242_create_audit_logs_table.sql

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_context_gin ON audit_logs USING gin(context);

-- Add RLS (Row Level Security)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit logs
-- Only admins and owners can view audit logs
CREATE POLICY "Admin can view audit logs" ON audit_logs
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'owner')
  );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- No one can update audit logs (immutable)
-- No one can delete audit logs (immutable)

-- Create function to log actions
CREATE OR REPLACE FUNCTION log_action(
  p_action TEXT,
  p_context JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (user_id, action, context)
  VALUES (auth.uid(), p_action, p_context)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for automatic logging
CREATE OR REPLACE FUNCTION trigger_audit_log() RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_context JSONB;
BEGIN
  -- Determine action type
  v_action := TG_TABLE_NAME || '.' || TG_OP;
  
  -- Build context
  v_context := jsonb_build_object(
    'table_name', TG_TABLE_NAME,
    'operation', TG_OP,
    'schema_name', TG_TABLE_SCHEMA
  );
  
  -- Add record data based on operation
  IF TG_OP = 'INSERT' THEN
    v_context := v_context || jsonb_build_object('new_data', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    v_context := v_context || jsonb_build_object(
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW),
      'changed_fields', (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(to_jsonb(NEW))
        WHERE value IS DISTINCT FROM (to_jsonb(OLD) ->> key)::jsonb
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_context := v_context || jsonb_build_object('old_data', to_jsonb(OLD));
  END IF;
  
  -- Insert audit log
  INSERT INTO audit_logs (user_id, action, context)
  VALUES (auth.uid(), v_action, v_context);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: Add audit triggers to important tables
-- Audit employer changes
CREATE TRIGGER audit_employers
  AFTER INSERT OR UPDATE OR DELETE ON employers
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

-- Audit invoice changes
CREATE TRIGGER audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

-- Create view for easy audit log access
CREATE OR REPLACE VIEW audit_log_summary AS
SELECT 
  al.id,
  al.created_at,
  al.action,
  al.context,
  u.email as user_email,
  u.raw_user_meta_data->>'full_name' as user_name,
  al.context->>'table_name' as table_name,
  al.context->>'operation' as operation
FROM audit_logs al
LEFT JOIN auth.users u ON al.user_id = u.id
ORDER BY al.created_at DESC;

-- Grant access to the view
GRANT SELECT ON audit_log_summary TO authenticated;

-- Sample data
INSERT INTO audit_logs (user_id, action, context) VALUES
  (NULL, 'system.startup', jsonb_build_object('version', '1.0.0', 'environment', 'production')),
  (NULL, 'invoice.generated', jsonb_build_object('month', '2025-07', 'count', 15, 'total_amount', 125000)),
  (NULL, 'email.sent', jsonb_build_object('type', 'invoice', 'recipient', 'billing@glowtech.com', 'status', 'delivered'));

-- END: 20250728184242_create_audit_logs_table.sql


-- START: 20250728184242_create_invoices_table.sql

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: 'YYYY-MM'
    total_amount INT NOT NULL,
    status TEXT CHECK (status IN ('Pending', 'Paid', 'Overdue', 'Processing')),
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_invoices_employer_id ON invoices(employer_id);
CREATE INDEX idx_invoices_month ON invoices(month);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_employer_month ON invoices(employer_id, month);

-- Create updated_at trigger
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add unique constraint to prevent duplicate invoices for same employer/month
ALTER TABLE invoices ADD CONSTRAINT unique_employer_month UNIQUE (employer_id, month);

-- Insert sample data (optional)
INSERT INTO invoices (employer_id, month, total_amount, status, pdf_url) VALUES
    ((SELECT id FROM employers WHERE name = 'Glow Tech Inc.'), '2025-07', 14200, 'Paid', '/invoices/glow-tech-2025-07.pdf'),
    ((SELECT id FROM employers WHERE name = 'Glow Tech Inc.'), '2025-06', 13800, 'Paid', '/invoices/glow-tech-2025-06.pdf'),
    ((SELECT id FROM employers WHERE name = 'Glow Tech Inc.'), '2025-05', 12500, 'Paid', '/invoices/glow-tech-2025-05.pdf'),
    ((SELECT id FROM employers WHERE name = 'Sunset Wellness'), '2025-07', 8300, 'Paid', '/invoices/sunset-2025-07.pdf'),
    ((SELECT id FROM employers WHERE name = 'Sunset Wellness'), '2025-06', 7900, 'Paid', '/invoices/sunset-2025-06.pdf'),
    ((SELECT id FROM employers WHERE name = 'Horizon Labs'), '2025-07', 18500, 'Processing', NULL),
    ((SELECT id FROM employers WHERE name = 'Horizon Labs'), '2025-06', 18300, 'Paid', '/invoices/horizon-2025-06.pdf'),
    ((SELECT id FROM employers WHERE name = 'BioPulse'), '2025-07', 6000, 'Pending', NULL),
    ((SELECT id FROM employers WHERE name = 'ElevateX'), '2025-07', 10750, 'Processing', NULL);

-- Create RLS policies
-- Policy for authenticated users to view invoices
CREATE POLICY "Authenticated users can view invoices" ON invoices
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for admin/owner roles to manage invoices
CREATE POLICY "Admin can manage invoices" ON invoices
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'owner')
    );

-- Create view for invoice summaries with employer info
CREATE VIEW invoice_summaries AS
SELECT 
    i.id,
    i.month,
    i.total_amount,
    i.status,
    i.pdf_url,
    i.created_at,
    e.id as employer_id,
    e.name as employer_name,
    e.billing_plan,
    e.custom_invoice_note
FROM invoices i
JOIN employers e ON i.employer_id = e.id
ORDER BY i.month DESC, e.name;

-- END: 20250728184242_create_invoices_table.sql


-- START: 20250728184242_create_members_table.sql

-- Create members table (needed for invoice generation)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_members_employer_id ON members(employer_id);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_active ON members(active);
CREATE INDEX idx_members_email ON members(email);

-- Create updated_at trigger
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO members (employer_id, first_name, last_name, email, active) VALUES
    ((SELECT id FROM employers WHERE name = 'Glow Tech Inc.'), 'John', 'Doe', 'john.doe@glowtech.com', true),
    ((SELECT id FROM employers WHERE name = 'Glow Tech Inc.'), 'Jane', 'Smith', 'jane.smith@glowtech.com', true),
    ((SELECT id FROM employers WHERE name = 'Glow Tech Inc.'), 'Bob', 'Johnson', 'bob.johnson@glowtech.com', true),
    ((SELECT id FROM employers WHERE name = 'Glow Tech Inc.'), 'Alice', 'Williams', 'alice.williams@glowtech.com', false),
    ((SELECT id FROM employers WHERE name = 'Sunset Wellness'), 'Michael', 'Brown', 'michael.brown@sunset.com', true),
    ((SELECT id FROM employers WHERE name = 'Sunset Wellness'), 'Sarah', 'Davis', 'sarah.davis@sunset.com', true),
    ((SELECT id FROM employers WHERE name = 'BioPulse'), 'David', 'Miller', 'david.miller@biopulse.com', true),
    ((SELECT id FROM employers WHERE name = 'BioPulse'), 'Emily', 'Wilson', 'emily.wilson@biopulse.com', true);

-- RLS Policies
-- Members can view their own record
CREATE POLICY "Members can view own record" ON members
    FOR SELECT USING (auth.uid() = user_id);

-- Members can view other members from same employer
CREATE POLICY "Members can view colleagues" ON members
    FOR SELECT USING (
        employer_id IN (
            SELECT employer_id FROM members WHERE user_id = auth.uid()
        )
    );

-- Admin/Owner can manage all members
CREATE POLICY "Admin can manage members" ON members
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'owner')
    );

-- END: 20250728184242_create_members_table.sql


-- START: 20250729025235_add_assistant_config_to_employers.sql

-- Add AI assistant configuration fields to employers table
ALTER TABLE employers 
ADD COLUMN IF NOT EXISTS assistant_model TEXT DEFAULT 'gpt-4',
ADD COLUMN IF NOT EXISTS assistant_tone TEXT DEFAULT 'professional',
ADD COLUMN IF NOT EXISTS assistant_voice TEXT DEFAULT 'Rachel',
ADD COLUMN IF NOT EXISTS assistant_temp FLOAT DEFAULT 0.7;

-- Add check constraints for valid values
ALTER TABLE employers
ADD CONSTRAINT check_assistant_model CHECK (
  assistant_model IN ('gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'gemini-pro')
),
ADD CONSTRAINT check_assistant_tone CHECK (
  assistant_tone IN ('professional', 'friendly', 'concise', 'detailed', 'casual')
),
ADD CONSTRAINT check_assistant_voice CHECK (
  assistant_voice IN ('Rachel', 'Adam', 'Bella', 'Domi', 'Antoni', 'Elli', 'Josh', 'Arnold', 'Sam')
),
ADD CONSTRAINT check_assistant_temp CHECK (
  assistant_temp >= 0 AND assistant_temp <= 2
);

-- Update sample data with different configurations
UPDATE employers SET
  assistant_model = 'gpt-4',
  assistant_tone = 'professional',
  assistant_voice = 'Rachel',
  assistant_temp = 0.7
WHERE name = 'Glow Tech Inc.';

UPDATE employers SET
  assistant_model = 'claude-3-opus',
  assistant_tone = 'friendly',
  assistant_voice = 'Bella',
  assistant_temp = 0.8
WHERE name = 'Sunset Wellness';

UPDATE employers SET
  assistant_model = 'gemini-pro',
  assistant_tone = 'concise',
  assistant_voice = 'Adam',
  assistant_temp = 0.5
WHERE name = 'Horizon Labs';

-- Create view for employer AI configurations
CREATE OR REPLACE VIEW employer_ai_configs AS
SELECT 
  id,
  name,
  subdomain,
  assistant_model,
  assistant_tone,
  assistant_voice,
  assistant_temp,
  primary_color,
  logo_url
FROM employers
ORDER BY name;

-- END: 20250729025235_add_assistant_config_to_employers.sql


