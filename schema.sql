create table if not exists budget (
  id text primary key default 'shared',
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

insert into budget (id, data) values ('shared', '{}') on conflict (id) do nothing;

alter table budget enable row level security;

create table if not exists allowed_emails (
  email text primary key,
  created_at timestamptz default now()
);

alter table allowed_emails enable row level security;

create policy "Authenticated users can check allowlist" on allowed_emails
  for select using (auth.uid() is not null);

create policy "Allowed users can read budget" on budget
  for select using (
    exists (select 1 from allowed_emails where email = auth.jwt()->>'email')
  );

create policy "Allowed users can update budget" on budget
  for update using (
    exists (select 1 from allowed_emails where email = auth.jwt()->>'email')
  );

create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger budget_updated_at
  before update on budget
  for each row execute function update_updated_at();
