-- Lumora Interiors — enquiry storage
-- Run once in the Supabase SQL editor.

create table if not exists public.enquiries (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  full_name        text not null check (char_length(full_name) between 2 and 120),
  phone            text not null check (char_length(phone) between 7 and 30),
  email            text not null check (char_length(email) <= 160),
  project_type     text not null,
  location         text not null check (char_length(location) <= 160),
  budget           text not null,
  start_window     text not null,
  details          text check (char_length(details) <= 2000),
  reference_project text,
  consent          boolean not null default false,
  ip_hash          text,
  user_agent       text,
  idempotency_key  text unique,
  status           text not null default 'new'
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_ip_hash_idx on public.enquiries (ip_hash, created_at);

-- Lock the table down: no anonymous access at all.
-- The serverless function uses the service-role key, which bypasses RLS.
alter table public.enquiries enable row level security;
revoke all on public.enquiries from anon, authenticated;
