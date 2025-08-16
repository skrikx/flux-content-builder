-- app_users mirrors auth.users we care about (email), owner = self
create table if not exists public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

alter table public.app_users enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='app_users' and policyname='app_users_owner_all'
  ) then
    create policy app_users_owner_all on public.app_users
      for all using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end$$;

-- add user_id to brands if missing
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='brands' and column_name='user_id') then
    alter table public.brands add column user_id uuid;
  end if;
end$$;

-- RLS for brands/content/schedules if not present
alter table public.brands enable row level security;
alter table public.content enable row level security;
alter table public.schedules enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='brands' and policyname='brands_owner_all') then
    create policy brands_owner_all on public.brands
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='content' and policyname='content_owner_all') then
    create policy content_owner_all on public.content
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='schedules' and policyname='schedules_owner_all') then
    create policy schedules_owner_all on public.schedules
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end$$;