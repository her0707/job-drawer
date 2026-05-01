create extension if not exists pgcrypto;

create type application_status as enum (
  'interested',
  'planned',
  'applied',
  'screening',
  'assignment_or_test',
  'interview_scheduling',
  'first_interview',
  'second_interview',
  'final_interview',
  'offer_negotiation',
  'accepted',
  'rejected',
  'on_hold',
  'withdrawn'
);

create type application_channel as enum (
  'wanted',
  'saramin',
  'jobkorea',
  'linkedin',
  'company_site',
  'headhunter',
  'referral',
  'remember',
  'rocketpunch',
  'other'
);

create type inbox_source as enum (
  'gmail',
  'email_manual',
  'kakao_paste',
  'sms_paste',
  'dm_paste',
  'manual'
);

create type inbox_status as enum (
  'pending',
  'linked',
  'ignored',
  'needs_review'
);

create type event_type as enum (
  'application_submitted',
  'screening_started',
  'screening_passed',
  'interview_invited',
  'interview_scheduled',
  'assignment_sent',
  'coding_test_sent',
  'offer_negotiation',
  'final_accepted',
  'rejected',
  'follow_up',
  'note',
  'other'
);

create type todo_status as enum (
  'open',
  'done',
  'dismissed'
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  channel application_channel not null default 'other',
  status application_status not null default 'planned',
  applied_at timestamptz,
  deadline_at timestamptz,
  last_contact_at timestamptz,
  job_post_url text,
  job_post_snapshot text,
  resume_version text,
  portfolio_version text,
  priority int not null default 3 check (priority between 1 and 5),
  next_action text,
  next_action_due_at timestamptz,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table inbox_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source inbox_source not null,
  status inbox_status not null default 'pending',
  received_at timestamptz not null default now(),
  title text,
  sender text,
  raw_text text,
  provider text,
  provider_message_id text,
  provider_thread_id text,
  provider_url text,
  extracted_company text,
  extracted_role text,
  extracted_event_type event_type,
  extracted_event_at timestamptz,
  extracted_deadline_at timestamptz,
  extracted_action_required text,
  suggested_status application_status,
  summary text,
  confidence numeric not null default 0,
  parsed_json jsonb,
  linked_application_id uuid references applications(id) on delete set null,
  linked_event_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, provider, provider_message_id)
);

create table application_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references applications(id) on delete cascade,
  inbox_item_id uuid references inbox_items(id) on delete set null,
  event_type event_type not null,
  title text not null,
  body text,
  occurred_at timestamptz not null default now(),
  source inbox_source not null default 'manual',
  raw_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table inbox_items
  add constraint inbox_items_linked_event_id_fkey
  foreign key (linked_event_id) references application_events(id) on delete set null;

create table todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references applications(id) on delete cascade,
  inbox_item_id uuid references inbox_items(id) on delete set null,
  title text not null,
  description text,
  due_at timestamptz,
  status todo_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table qa_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references applications(id) on delete cascade,
  question text not null,
  answer text not null,
  submitted_at timestamptz,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references applications(id) on delete cascade,
  kind text not null,
  name text not null,
  version text,
  storage_path text,
  external_url text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table email_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'gmail',
  email text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  last_synced_at timestamptz,
  sync_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, provider, email)
);

create table email_sync_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email_account_id uuid references email_accounts(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  fetched_count int not null default 0,
  created_inbox_count int not null default 0,
  error_message text
);

create index applications_user_id_idx on applications(user_id);
create index applications_status_idx on applications(status);
create index applications_company_role_idx on applications(user_id, company, role);
create index inbox_items_user_id_idx on inbox_items(user_id);
create index inbox_items_status_idx on inbox_items(status);
create index inbox_items_received_at_idx on inbox_items(received_at desc);
create index application_events_application_id_idx on application_events(application_id);
create index application_events_occurred_at_idx on application_events(occurred_at desc);
create index todos_user_id_idx on todos(user_id);
create index todos_status_due_idx on todos(status, due_at);
create index qa_entries_application_id_idx on qa_entries(application_id);
create index documents_application_id_idx on documents(application_id);
create index email_accounts_user_id_idx on email_accounts(user_id);
create index email_sync_logs_account_idx on email_sync_logs(email_account_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger applications_updated_at before update on applications
  for each row execute function set_updated_at();
create trigger inbox_items_updated_at before update on inbox_items
  for each row execute function set_updated_at();
create trigger application_events_updated_at before update on application_events
  for each row execute function set_updated_at();
create trigger todos_updated_at before update on todos
  for each row execute function set_updated_at();
create trigger qa_entries_updated_at before update on qa_entries
  for each row execute function set_updated_at();
create trigger documents_updated_at before update on documents
  for each row execute function set_updated_at();
create trigger email_accounts_updated_at before update on email_accounts
  for each row execute function set_updated_at();

alter table applications enable row level security;
alter table inbox_items enable row level security;
alter table application_events enable row level security;
alter table todos enable row level security;
alter table qa_entries enable row level security;
alter table documents enable row level security;
alter table email_accounts enable row level security;
alter table email_sync_logs enable row level security;

create policy "Users can select own applications" on applications for select using (auth.uid() = user_id);
create policy "Users can insert own applications" on applications for insert with check (auth.uid() = user_id);
create policy "Users can update own applications" on applications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own applications" on applications for delete using (auth.uid() = user_id);

create policy "Users can select own inbox_items" on inbox_items for select using (auth.uid() = user_id);
create policy "Users can insert own inbox_items" on inbox_items for insert with check (auth.uid() = user_id);
create policy "Users can update own inbox_items" on inbox_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own inbox_items" on inbox_items for delete using (auth.uid() = user_id);

create policy "Users can select own application_events" on application_events for select using (auth.uid() = user_id);
create policy "Users can insert own application_events" on application_events for insert with check (auth.uid() = user_id);
create policy "Users can update own application_events" on application_events for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own application_events" on application_events for delete using (auth.uid() = user_id);

create policy "Users can select own todos" on todos for select using (auth.uid() = user_id);
create policy "Users can insert own todos" on todos for insert with check (auth.uid() = user_id);
create policy "Users can update own todos" on todos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own todos" on todos for delete using (auth.uid() = user_id);

create policy "Users can select own qa_entries" on qa_entries for select using (auth.uid() = user_id);
create policy "Users can insert own qa_entries" on qa_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own qa_entries" on qa_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own qa_entries" on qa_entries for delete using (auth.uid() = user_id);

create policy "Users can select own documents" on documents for select using (auth.uid() = user_id);
create policy "Users can insert own documents" on documents for insert with check (auth.uid() = user_id);
create policy "Users can update own documents" on documents for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own documents" on documents for delete using (auth.uid() = user_id);

create policy "Users can select own email_accounts" on email_accounts for select using (auth.uid() = user_id);
create policy "Users can insert own email_accounts" on email_accounts for insert with check (auth.uid() = user_id);
create policy "Users can update own email_accounts" on email_accounts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own email_accounts" on email_accounts for delete using (auth.uid() = user_id);

create policy "Users can select own email_sync_logs" on email_sync_logs for select using (auth.uid() = user_id);
create policy "Users can insert own email_sync_logs" on email_sync_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own email_sync_logs" on email_sync_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own email_sync_logs" on email_sync_logs for delete using (auth.uid() = user_id);
