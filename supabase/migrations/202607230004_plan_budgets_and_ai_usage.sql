alter table public.audri_users
  add column if not exists billing_plan text check (billing_plan in ('student', 'power', 'sprint')),
  add column if not exists paid_essays_generated integer not null default 0 check (paid_essays_generated >= 0),
  add column if not exists paid_quota_window_started_at timestamptz not null default now();

update public.audri_users
set paid_quota_window_started_at = coalesce(paid_quota_window_started_at, upgraded_at, created_at, now())
where paid_quota_window_started_at is null;

create table if not exists public.audri_ai_usage (
  id uuid primary key default gen_random_uuid(),
  route text not null,
  phase text not null,
  model text not null,
  user_email text,
  plan text,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  success boolean not null,
  error_code text,
  created_at timestamptz not null default now()
);

alter table public.audri_ai_usage enable row level security;
revoke all on public.audri_ai_usage from anon, authenticated;
grant select, insert on table public.audri_ai_usage to service_role;

create index if not exists audri_ai_usage_created_idx on public.audri_ai_usage(created_at desc);
create index if not exists audri_ai_usage_route_idx on public.audri_ai_usage(route, phase);
create index if not exists audri_ai_usage_user_idx on public.audri_ai_usage(user_email);

create or replace function public.reserve_audri_essay(p_email text, p_limit integer)
returns setof public.audri_users
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.audri_users
  set
    essays_generated = case
      when plan = 'pro' and (pro_expires_at is null or pro_expires_at > now()) then essays_generated
      when quota_window_started_at <= now() - interval '7 days' then 1
      else essays_generated + 1
    end,
    quota_window_started_at = case
      when plan = 'pro' and (pro_expires_at is null or pro_expires_at > now()) then quota_window_started_at
      when quota_window_started_at <= now() - interval '7 days' then now()
      else quota_window_started_at
    end,
    paid_essays_generated = case
      when not (plan = 'pro' and (pro_expires_at is null or pro_expires_at > now())) then paid_essays_generated
      when paid_quota_window_started_at <= now() - interval '30 days' then 1
      else paid_essays_generated + 1
    end,
    paid_quota_window_started_at = case
      when not (plan = 'pro' and (pro_expires_at is null or pro_expires_at > now())) then paid_quota_window_started_at
      when paid_quota_window_started_at <= now() - interval '30 days' then now()
      else paid_quota_window_started_at
    end,
    updated_at = now()
  where email = lower(p_email)
    and (
      (
        plan = 'pro'
        and (pro_expires_at is null or pro_expires_at > now())
        and (case when paid_quota_window_started_at <= now() - interval '30 days' then 0 else paid_essays_generated end)
          < case billing_plan when 'power' then 100 when 'sprint' then 100 else 30 end
      )
      or
      (
        not (plan = 'pro' and (pro_expires_at is null or pro_expires_at > now()))
        and (case when quota_window_started_at <= now() - interval '7 days' then 0 else essays_generated end) < p_limit
      )
    )
  returning *;
end;
$$;

create or replace function public.release_audri_essay(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.audri_users
  set
    essays_generated = case
      when plan = 'pro' and (pro_expires_at is null or pro_expires_at > now()) then essays_generated
      else greatest(0, essays_generated - 1)
    end,
    paid_essays_generated = case
      when plan = 'pro' and (pro_expires_at is null or pro_expires_at > now()) then greatest(0, paid_essays_generated - 1)
      else paid_essays_generated
    end,
    updated_at = now()
  where email = lower(p_email);
end;
$$;

revoke all on function public.reserve_audri_essay(text, integer) from public, anon, authenticated;
revoke all on function public.release_audri_essay(text) from public, anon, authenticated;
grant execute on function public.reserve_audri_essay(text, integer) to service_role;
grant execute on function public.release_audri_essay(text) to service_role;
