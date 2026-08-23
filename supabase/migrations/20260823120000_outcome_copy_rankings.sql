create table public.outcome_copy_events (
  outcome_id uuid not null references public.outcomes(id) on delete cascade,
  visitor_token uuid not null,
  copied_on date not null,
  copied_at timestamptz not null default now(),
  primary key (outcome_id, visitor_token, copied_on),
  constraint outcome_copy_events_day_matches_timestamp check (
    copied_on = (copied_at at time zone 'UTC')::date
  )
);

create index outcome_copy_events_recent_idx
on public.outcome_copy_events (copied_at desc, outcome_id);

alter table public.outcome_copy_events enable row level security;

create function public.record_outcome_copy(
  target_outcome_id uuid,
  client_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
  current_timestamp_utc timestamptz := now();
begin
  if not exists (
    select 1
    from public.outcomes
    where id = target_outcome_id
      and status = 'published'
  ) then
    return false;
  end if;

  insert into public.outcome_copy_events (
    outcome_id,
    visitor_token,
    copied_on,
    copied_at
  ) values (
    target_outcome_id,
    client_token,
    (current_timestamp_utc at time zone 'UTC')::date,
    current_timestamp_utc
  )
  on conflict do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count = 1;
end;
$$;

create function public.get_source_copy_rankings_7d(
  page_size integer default 10,
  page_offset integer default 0
)
returns table (
  source_type text,
  source_id uuid,
  source_slug text,
  source_name text,
  owner_name text,
  logo_url text,
  href text,
  copy_count bigint,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with recent_copies as (
    select copy_events.outcome_id
    from public.outcome_copy_events copy_events
    join public.outcomes on outcomes.id = copy_events.outcome_id
    where outcomes.status = 'published'
      and copy_events.copied_at >= now() - interval '7 days'
  ),
  attributed_sources as (
    select
      'product'::text as source_type,
      products.id as source_id,
      products.slug as source_slug,
      products.name as source_name,
      companies.name as owner_name,
      products.logo_url,
      '/products/' || products.slug as href
    from recent_copies
    join public.outcome_products on outcome_products.outcome_id = recent_copies.outcome_id
    join public.products on products.id = outcome_products.product_id
    join public.companies on companies.id = products.company_id
    where products.status = 'published'

    union all

    select
      'skill'::text as source_type,
      skills.id as source_id,
      replace(skills.repository || '/' || skills.directory, '/', '--') as source_slug,
      skills.name as source_name,
      skills.repository as owner_name,
      null::text as logo_url,
      '/skills/' || replace(skills.repository || '/' || skills.directory, '/', '--') as href
    from recent_copies
    join public.outcome_skills on outcome_skills.outcome_id = recent_copies.outcome_id
    join public.skills on skills.id = outcome_skills.skill_id
  ),
  ranked_sources as (
    select
      attributed_sources.source_type,
      attributed_sources.source_id,
      attributed_sources.source_slug,
      attributed_sources.source_name,
      attributed_sources.owner_name,
      attributed_sources.logo_url,
      attributed_sources.href,
      count(*)::bigint as copy_count
    from attributed_sources
    group by
      attributed_sources.source_type,
      attributed_sources.source_id,
      attributed_sources.source_slug,
      attributed_sources.source_name,
      attributed_sources.owner_name,
      attributed_sources.logo_url,
      attributed_sources.href
  )
  select
    ranked_sources.source_type,
    ranked_sources.source_id,
    ranked_sources.source_slug,
    ranked_sources.source_name,
    ranked_sources.owner_name,
    ranked_sources.logo_url,
    ranked_sources.href,
    ranked_sources.copy_count,
    count(*) over()::bigint as total_count
  from ranked_sources
  order by ranked_sources.copy_count desc, ranked_sources.source_name, ranked_sources.source_id
  limit least(greatest(page_size, 1), 50)
  offset greatest(page_offset, 0);
$$;

revoke all on public.outcome_copy_events from public, anon, authenticated;
grant all on public.outcome_copy_events to service_role;

revoke all on function public.record_outcome_copy(uuid, uuid) from public;
grant execute on function public.record_outcome_copy(uuid, uuid) to anon, authenticated, service_role;

revoke all on function public.get_source_copy_rankings_7d(integer, integer) from public;
grant execute on function public.get_source_copy_rankings_7d(integer, integer) to anon, authenticated, service_role;
