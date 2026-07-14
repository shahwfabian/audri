create extension if not exists pgcrypto;

create table if not exists public.audri_users (
  id text primary key,
  email text not null unique check (email = lower(email)),
  name text not null,
  password_hash text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  essays_generated integer not null default 0 check (essays_generated >= 0),
  profile_enc text,
  workspace_enc text,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status text,
  session_version integer not null default 1,
  terms_accepted_at timestamptz not null,
  terms_version text not null,
  upgraded_at timestamptz,
  password_reset_digest text,
  password_reset_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.audri_users enable row level security;
revoke all on public.audri_users from anon, authenticated;
grant select, insert, update, delete on table public.audri_users to service_role;

create or replace function public.reserve_audri_essay(p_email text, p_limit integer)
returns setof public.audri_users
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.audri_users
  set essays_generated = essays_generated + 1, updated_at = now()
  where email = lower(p_email)
    and (plan = 'pro' or essays_generated < p_limit)
  returning *;
end;
$$;

create or replace function public.release_audri_essay(p_email text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.audri_users
  set essays_generated = greatest(0, essays_generated - 1), updated_at = now()
  where email = lower(p_email);
$$;

create or replace function public.reset_audri_password(p_digest text, p_password_hash text)
returns setof public.audri_users
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.audri_users
  set password_hash = p_password_hash,
      password_reset_digest = null,
      password_reset_expires_at = null,
      session_version = session_version + 1,
      updated_at = now()
  where password_reset_digest = p_digest
    and password_reset_expires_at > now()
  returning *;
end;
$$;

revoke all on function public.reserve_audri_essay(text, integer) from public, anon, authenticated;
revoke all on function public.release_audri_essay(text) from public, anon, authenticated;
revoke all on function public.reset_audri_password(text, text) from public, anon, authenticated;
grant execute on function public.reserve_audri_essay(text, integer) to service_role;
grant execute on function public.release_audri_essay(text) to service_role;
grant execute on function public.reset_audri_password(text, text) to service_role;

create index if not exists audri_users_stripe_customer_idx on public.audri_users(stripe_customer_id);
create index if not exists audri_users_subscription_idx on public.audri_users(stripe_subscription_id);

create table if not exists public.audri_rate_limits (
  key text primary key,
  count integer not null,
  reset_at timestamptz not null
);

alter table public.audri_rate_limits enable row level security;
revoke all on public.audri_rate_limits from anon, authenticated;
grant select, insert, update, delete on table public.audri_rate_limits to service_role;

create or replace function public.check_audri_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns table(allowed boolean, retry_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  current_reset timestamptz;
begin
  insert into public.audri_rate_limits as limits(key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update
  set count = case when limits.reset_at <= now() then 1 else limits.count + 1 end,
      reset_at = case when limits.reset_at <= now() then now() + make_interval(secs => p_window_seconds) else limits.reset_at end
  returning count, reset_at into current_count, current_reset;

  return query select current_count <= p_limit, greatest(1, ceil(extract(epoch from current_reset - now()))::integer);
end;
$$;

revoke all on function public.check_audri_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_audri_rate_limit(text, integer, integer) to service_role;

create table if not exists public.scholarships (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text,
  description text,
  award_amount_min numeric,
  award_amount_max numeric,
  deadline date,
  eligibility jsonb not null default '{}'::jsonb,
  requirements jsonb not null default '{}'::jsonb,
  essay_prompts jsonb not null default '[]'::jsonb,
  application_url text,
  source_name text,
  source_url text,
  confidence_score integer not null default 0,
  normalized_key text not null unique,
  status text not null default 'active' check (status in ('active', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.scholarships enable row level security;
revoke all on public.scholarships from anon, authenticated;
grant select, insert, update, delete on table public.scholarships to service_role;
create index if not exists scholarships_status_deadline_idx on public.scholarships(status, deadline);
create index if not exists scholarships_updated_idx on public.scholarships(updated_at desc);
