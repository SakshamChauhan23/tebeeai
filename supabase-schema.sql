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

-- Fires the send-confirmation-email Edge Function on every new submission.
-- Requires the pg_net extension (enabled below) and the function already
-- deployed via `supabase functions deploy send-confirmation-email`.
create extension if not exists pg_net with schema extensions;

create or replace function public.notify_send_confirmation_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://fxlyuykucnydxqtapbgf.supabase.co/functions/v1/send-confirmation-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      -- The project's anon key. Safe to store here: it is already public
      -- in script.js and is only used to satisfy the Edge Function
      -- gateway's JWT check, not to grant any elevated access.
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4bHl1eWt1Y255ZHhxdGFwYmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMDA4NjYsImV4cCI6MjA5ODc3Njg2Nn0.-ILnbGUzddi1B4ORvOr-B7AzFS7-bLxaGA75_h7Q1J8'
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  return NEW;
end;
$$;

drop trigger if exists trg_send_confirmation_email on public.contact_submissions;

create trigger trg_send_confirmation_email
after insert on public.contact_submissions
for each row
execute function public.notify_send_confirmation_email();
