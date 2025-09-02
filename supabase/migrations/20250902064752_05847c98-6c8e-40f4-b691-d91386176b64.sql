-- ====== EXTENSIONS ======
create extension if not exists pgcrypto;
create extension if not exists vector;

-- ====== CORE TABLES (create if missing) ======
create table if not exists public.research_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  brand_id uuid not null references public.brands(id) on delete cascade,
  topic text not null,
  inputs jsonb not null default '{}'::jsonb,
  outputs jsonb not null default '{}'::jsonb,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

create table if not exists public.event_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  brand_id uuid,
  event_type text not null,
  ref_table text,
  ref_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content(id) on delete cascade,
  user_id uuid not null,
  version int not null,
  body jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_quota (
  user_id uuid not null,
  endpoint text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (user_id, endpoint, window_start)
);

create table if not exists public.provider_key_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null,
  old_key_hash text not null,
  rotated_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ====== COLUMN UPGRADES ======
alter table public.content
  add column if not exists research_run_id uuid references public.research_runs(id) on delete set null;

alter table public.brands
  add column if not exists style_rules jsonb default '{}'::jsonb;

alter table public.content
  add column if not exists brand_compliance jsonb;

-- provider_keys: ensure canonical 'provider' column + metadata
alter table public.provider_keys add column if not exists provider text;
alter table public.provider_keys
  add column if not exists last_tested_at timestamptz,
  add column if not exists last_test_result text,
  add column if not exists scopes text[] default '{}'::text[];

-- embeddings (may already exist)
alter table public.content add column if not exists embedding vector(3072);

-- ====== RLS ENABLE ======
alter table public.research_runs enable row level security;
alter table public.event_log enable row level security;
alter table public.content_versions enable row level security;
alter table public.usage_quota enable row level security;
alter table public.provider_key_history enable row level security;
alter table public.audit_log enable row level security;

-- ====== RLS POLICIES ======
do $$
begin
  -- research_runs
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='research_runs' and policyname='research owner read') then
    create policy "research owner read" on public.research_runs for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='research_runs' and policyname='research owner insert') then
    create policy "research owner insert" on public.research_runs for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='research_runs' and policyname='research owner update') then
    create policy "research owner update" on public.research_runs for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='research_runs' and policyname='research owner delete') then
    create policy "research owner delete" on public.research_runs for delete using (auth.uid() = user_id);
  end if;

  -- event_log
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='event_log' and policyname='event owner read') then
    create policy "event owner read" on public.event_log for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='event_log' and policyname='event owner insert') then
    create policy "event owner insert" on public.event_log for insert with check (auth.uid() = user_id);
  end if;

  -- content_versions
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='content_versions' and policyname='versions owner select') then
    create policy "versions owner select" on public.content_versions for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='content_versions' and policyname='versions owner insert') then
    create policy "versions owner insert" on public.content_versions for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='content_versions' and policyname='versions owner update') then
    create policy "versions owner update" on public.content_versions for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='content_versions' and policyname='versions owner delete') then
    create policy "versions owner delete" on public.content_versions for delete using (auth.uid() = user_id);
  end if;

  -- usage_quota
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='usage_quota' and policyname='quota owner all') then
    create policy "quota owner all" on public.usage_quota for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  -- provider_key_history
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='provider_key_history' and policyname='key hist owner all') then
    create policy "key hist owner all" on public.provider_key_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  -- audit_log
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='audit_log' and policyname='audit owner select') then
    create policy "audit owner select" on public.audit_log for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='audit_log' and policyname='audit owner insert') then
    create policy "audit owner insert" on public.audit_log for insert with check (auth.uid() = user_id);
  end if;
end$$;

-- ====== TRIGGER FUNCTIONS + TRIGGERS ======
create or replace function public.log_content_event() returns trigger as $$
begin
  insert into public.event_log(user_id, brand_id, event_type, ref_table, ref_id, payload)
  values (new.user_id, new.brand_id, 'content.generated', 'content', new.id, to_jsonb(new));
  return new;
end$$ language plpgsql;

create or replace function public.log_research_event() returns trigger as $$
begin
  insert into public.event_log(user_id, brand_id, event_type, ref_table, ref_id, payload)
  values (new.user_id, new.brand_id, 'research.completed', 'research_runs', new.id, to_jsonb(new));
  return new;
end$$ language plpgsql;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname='trg_content_event') then
    create trigger trg_content_event after insert on public.content
    for each row execute function public.log_content_event();
  end if;

  if not exists (select 1 from pg_trigger where tgname='trg_research_event') then
    create trigger trg_research_event after insert on public.research_runs
    for each row execute function public.log_research_event();
  end if;
end$$;

-- ====== INDEXES (safe) ======
create index if not exists idx_research_user_created on public.research_runs(user_id, created_at desc);
create index if not exists idx_content_research on public.content(research_run_id);
create index if not exists idx_event_user_type_time on public.event_log(user_id, event_type, created_at desc);
create index if not exists idx_audit_user_time on public.audit_log(user_id, created_at desc);
create index if not exists idx_content_user_created on public.content(user_id, created_at desc);
create unique index if not exists idx_content_versions_unique on public.content_versions(content_id, version);
create index if not exists idx_content_versions_user on public.content_versions(user_id);

-- provider_keys composite index (guard provider col)
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='provider_keys' and column_name='provider') then
    if not exists (select 1 from pg_indexes where schemaname='public' and tablename='provider_keys' and indexname='idx_provider_keys_user_provider') then
      create index idx_provider_keys_user_provider on public.provider_keys(user_id, provider);
    end if;
  end if;
end$$;

-- ====== STORAGE POLICIES (content-assets write/delete prefixes) ======
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='users write only their prefix'
  ) then
    create policy "users write only their prefix"
      on storage.objects for insert
      with check (bucket_id='content-assets' and (storage.foldername(name))[1:2] = array['gen', auth.uid()::text]);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='users delete their files'
  ) then
    create policy "users delete their files"
      on storage.objects for delete
      using (bucket_id='content-assets' and (storage.foldername(name))[1:2] = array['gen', auth.uid()::text]);
  end if;
end$$;

-- ====== PROVIDER_KEYS COMPAT VIEW (shim for legacy JSONB clients) ======
create or replace view public.provider_keys_compact as
select user_id,
       jsonb_object_agg(provider, jsonb_build_object(
         'last_tested_at', last_tested_at,
         'last_test_result', last_test_result,
         'scopes', coalesce(scopes, '{}'::text[])
       )) as keys
from public.provider_keys
where provider is not null
group by user_id;

-- ====== ANN INDEX HANDLER (skip gracefully if >2000 dims / unsupported) ======
do $$
begin
  if exists (select 1 from pg_indexes where schemaname='public' and indexname='idx_content_embedding') then
    raise notice 'idx_content_embedding already exists';
    return;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='content' and column_name='embedding'
  ) then
    raise notice 'Skipping ANN index: embedding column not found';
    return;
  end if;

  begin
    execute 'create index idx_content_embedding on public.content using hnsw (embedding vector_cosine_ops)';
    raise notice 'Created HNSW index on content.embedding';
  exception
    when others then
      begin
        execute 'create index idx_content_embedding on public.content using ivfflat (embedding vector_cosine_ops) with (lists = 100)';
        raise notice 'Created IVFFLAT index on content.embedding';
      exception
        when others then
          raise notice 'Skipped ANN index for content.embedding (likely dim > 2000 or method unavailable). Exact search remains available.';
      end;
  end;
end$$;