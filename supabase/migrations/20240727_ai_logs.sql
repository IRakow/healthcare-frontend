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