-- Enable required extensions only if available
create extension if not exists "uuid-ossp";

-- brands
create table if not exists public.brands (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  name text not null,
  voice text,
  tone text,
  style jsonb,
  assets jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- content
create table if not exists public.content (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  brand_id uuid not null references public.brands(id) on delete cascade,
  type text not null check (type in ('text','image','video','idea')),
  title text,
  data jsonb,         -- for text: markdown, for image or video: urls and meta
  status text not null default 'ready', -- ready, scheduled, published, failed
  created_at timestamptz default now()
);

-- schedules
create table if not exists public.schedules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  content_id uuid not null references public.content(id) on delete cascade,
  platform text not null,               -- buffer, ghl, webhook
  publish_time timestamptz not null,
  status text not null default 'pending', -- pending, posted, failed
  retries int not null default 0,
  meta jsonb,
  created_at timestamptz default now()
);

-- Simple provider prefs per user
create table if not exists public.provider_prefs (
  user_id uuid primary key,
  text_mode text default 'free',   -- free or premium
  image_mode text default 'free',
  video_mode text default 'free'
);

-- Storage bucket for content assets
insert into storage.buckets (id, name, public) values ('content-assets', 'content-assets', true)
on conflict (id) do nothing;

-- RLS
alter table public.brands enable row level security;
alter table public.content enable row level security;
alter table public.schedules enable row level security;
alter table public.provider_prefs enable row level security;

-- Policies: owner only
drop policy if exists brands_owner_select on public.brands;
create policy brands_owner_select on public.brands
  for select using (auth.uid() = user_id);

drop policy if exists brands_owner_all on public.brands;
create policy brands_owner_all on public.brands
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists content_owner_select on public.content;
create policy content_owner_select on public.content
  for select using (auth.uid() = user_id);

drop policy if exists content_owner_all on public.content;
create policy content_owner_all on public.content
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists schedules_owner_select on public.schedules;
create policy schedules_owner_select on public.schedules
  for select using (auth.uid() = user_id);

drop policy if exists schedules_owner_all on public.schedules;
create policy schedules_owner_all on public.schedules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists prefs_owner_select on public.provider_prefs;
create policy prefs_owner_select on public.provider_prefs
  for select using (auth.uid() = user_id);

drop policy if exists prefs_owner_all on public.provider_prefs;
create policy prefs_owner_all on public.provider_prefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage policies for content-assets bucket
drop policy if exists "Users can view content assets" on storage.objects;
create policy "Users can view content assets" 
on storage.objects 
for select 
using (bucket_id = 'content-assets');

drop policy if exists "Users can upload content assets" on storage.objects;
create policy "Users can upload content assets" 
on storage.objects 
for insert 
with check (bucket_id = 'content-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can update their content assets" on storage.objects;
create policy "Users can update their content assets" 
on storage.objects 
for update 
using (bucket_id = 'content-assets' AND auth.uid()::text = (storage.foldername(name))[1]);