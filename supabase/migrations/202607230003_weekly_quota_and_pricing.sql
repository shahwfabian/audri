alter table public.audri_users
  add column if not exists quota_window_started_at timestamptz not null default now(),
  add column if not exists pro_expires_at timestamptz;

update public.audri_users
set quota_window_started_at = coalesce(quota_window_started_at, created_at, now())
where quota_window_started_at is null;

create or replace function public.reserve_audri_essay(p_email text, p_limit integer)
returns setof public.audri_users
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.audri_users
  set essays_generated = case
        when plan = 'pro' and (pro_expires_at is null or pro_expires_at > now()) then essays_generated
        when quota_window_started_at <= now() - interval '7 days' then 1
        else essays_generated + 1
      end,
      quota_window_started_at = case
        when plan = 'pro' and (pro_expires_at is null or pro_expires_at > now()) then quota_window_started_at
        when quota_window_started_at <= now() - interval '7 days' then now()
        else quota_window_started_at
      end,
      updated_at = now()
  where email = lower(p_email)
    and (
      (plan = 'pro' and (pro_expires_at is null or pro_expires_at > now()))
      or
      (case when quota_window_started_at <= now() - interval '7 days' then 0 else essays_generated end) < p_limit
    )
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
  where email = lower(p_email)
    and not (plan = 'pro' and (pro_expires_at is null or pro_expires_at > now()));
$$;

revoke all on function public.reserve_audri_essay(text, integer) from public, anon, authenticated;
revoke all on function public.release_audri_essay(text) from public, anon, authenticated;
grant execute on function public.reserve_audri_essay(text, integer) to service_role;
grant execute on function public.release_audri_essay(text) to service_role;
