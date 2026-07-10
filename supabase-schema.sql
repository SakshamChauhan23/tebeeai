-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query)
-- Creates the table the contact form writes to, with row level security
-- locked down so the public anon key can only insert, never read, update,
-- or delete existing submissions.

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  business text not null,
  problem text not null
);

alter table public.contact_submissions enable row level security;

create policy "Allow public inserts"
  on public.contact_submissions
  for insert
  to anon
  with check (true);
