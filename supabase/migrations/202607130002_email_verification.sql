alter table public.audri_users
  add column if not exists email_verified_at timestamptz;

update public.audri_users
set email_verified_at = coalesce(email_verified_at, created_at)
where email_verified_at is null;

alter table public.audri_users
  alter column email_verified_at set default now(),
  alter column email_verified_at set not null;

create table if not exists public.audri_pending_signups (
  email text primary key check (email = lower(email)),
  name text not null,
  password_hash text not null,
  terms_accepted_at timestamptz not null,
  terms_version text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.audri_pending_signups enable row level security;
revoke all on public.audri_pending_signups from anon, authenticated;

grant select, insert, update, delete on table public.audri_users to service_role;
grant select, insert, update, delete on table public.audri_pending_signups to service_role;
grant select, insert, update, delete on table public.audri_rate_limits to service_role;
grant select, insert, update, delete on table public.scholarships to service_role;

create index if not exists audri_pending_signups_expires_idx
  on public.audri_pending_signups(expires_at);
