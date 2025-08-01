-- Create employer_settings table
create table employer_settings (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references employers(id),
  default_voice text,
  features jsonb,
  updated_at timestamp default now()
);

-- Create index on employer_id for faster lookups
create index idx_employer_settings_employer_id on employer_settings(employer_id);

-- Create trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_employer_settings_updated_at
  before update on employer_settings
  for each row
  execute function update_updated_at_column();

-- Add RLS policies
alter table employer_settings enable row level security;

-- Policy for admins to manage all employer settings
create policy "Admins can manage all employer settings"
  on employer_settings
  for all
  using (auth.jwt() ->> 'role' = 'admin');

-- Policy for owners to manage their employer settings
create policy "Owners can manage their employer settings"
  on employer_settings
  for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'owner'
      and users.employer_id = employer_settings.employer_id
    )
  );

-- Policy for users to view their employer settings
create policy "Users can view their employer settings"
  on employer_settings
  for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.employer_id = employer_settings.employer_id
    )
  );

-- Insert default settings for existing employers
insert into employer_settings (employer_id, default_voice, features)
select 
  id,
  'Rachel',
  jsonb_build_object(
    'AI', true,
    'Video', true,
    'Chat', true,
    'Voice', true
  )
from employers
where not exists (
  select 1 from employer_settings
  where employer_settings.employer_id = employers.id
);