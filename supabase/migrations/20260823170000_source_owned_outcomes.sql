-- Replace hosted publishing, accounts, claims, and gallery imports with a
-- source-owned Outcome registry. This migration has not been deployed before
-- this contract change; existing rows are pre-product test data.

drop table if exists public.claim_transfers cascade;
drop table if exists public.listing_claim_events cascade;
drop table if exists public.listing_claims cascade;
drop table if exists public.outcome_endorsements cascade;
drop table if exists public.account_outcome_publication_events cascade;
drop table if exists public.outcome_publication_events cascade;
drop table if exists public.outcome_edits cascade;
drop table if exists public.outcome_media cascade;
drop table if exists public.outcome_products cascade;
drop table if exists public.outcome_skills cascade;
drop table if exists public.outcome_reviews cascade;
drop table if exists public.outcome_copy_events cascade;
drop table if exists public.outcomes cascade;
drop table if exists public.scan_runs cascade;
drop table if exists public.gallery_sources cascade;
drop table if exists public.products cascade;
drop table if exists public.skills cascade;
drop table if exists public.company_members cascade;
drop table if exists public.companies cascade;
drop table if exists public.platform_admins cascade;
drop table if exists public.account_members cascade;
drop table if exists public.accounts cascade;

create table public.outcome_sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  locator text not null,
  install_url text not null,
  publisher_name text not null,
  current_revision text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint outcome_sources_type check (source_type in ('github', 'well-known')),
  constraint outcome_sources_locator_present check (btrim(locator) <> ''),
  constraint outcome_sources_install_https check (install_url ~ '^https://'),
  constraint outcome_sources_publisher_present check (btrim(publisher_name) <> ''),
  constraint outcome_sources_revision_present check (btrim(current_revision) <> ''),
  constraint outcome_sources_locator_unique unique (source_type, locator)
);

create table public.outcomes (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.outcome_sources(id) on delete cascade,
  slug text not null,
  current_snapshot_id uuid,
  status text not null default 'published',
  publication_kind text not null default 'community',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint outcomes_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  constraint outcomes_status check (status in ('published', 'hidden')),
  constraint outcomes_publication_kind check (publication_kind in ('official', 'community')),
  constraint outcomes_source_slug_unique unique (source_id, slug)
);

create table public.outcome_snapshots (
  id uuid primary key default gen_random_uuid(),
  outcome_id uuid not null references public.outcomes(id) on delete cascade,
  source_revision text not null,
  content_hash text not null,
  manifest jsonb not null,
  about_markdown text not null,
  prompt_markdown text not null,
  title text not null,
  summary text not null,
  requirements text[] not null default '{}',
  models jsonb not null default '[]',
  products jsonb not null default '[]',
  skills jsonb not null default '[]',
  preview jsonb,
  inputs jsonb not null default '[]',
  artifacts jsonb not null default '[]',
  result_media_url text,
  poster_url text,
  manifest_url text not null,
  about_url text not null,
  prompt_url text not null,
  created_at timestamptz not null default now(),
  constraint outcome_snapshots_hash check (content_hash ~ '^sha256:[0-9a-f]{64}$'),
  constraint outcome_snapshots_title_present check (btrim(title) <> ''),
  constraint outcome_snapshots_summary_present check (btrim(summary) <> ''),
  constraint outcome_snapshots_about_present check (btrim(about_markdown) <> ''),
  constraint outcome_snapshots_prompt_present check (btrim(prompt_markdown) <> ''),
  constraint outcome_snapshots_models_array check (jsonb_typeof(models) = 'array'),
  constraint outcome_snapshots_products_array check (jsonb_typeof(products) = 'array'),
  constraint outcome_snapshots_skills_array check (jsonb_typeof(skills) = 'array'),
  constraint outcome_snapshots_inputs_array check (jsonb_typeof(inputs) = 'array'),
  constraint outcome_snapshots_artifacts_array check (jsonb_typeof(artifacts) = 'array'),
  constraint outcome_snapshots_result_https check (result_media_url is null or result_media_url ~ '^https://'),
  constraint outcome_snapshots_poster_https check (poster_url is null or poster_url ~ '^https://'),
  constraint outcome_snapshots_manifest_https check (manifest_url ~ '^https://'),
  constraint outcome_snapshots_about_https check (about_url ~ '^https://'),
  constraint outcome_snapshots_prompt_https check (prompt_url ~ '^https://'),
  constraint outcome_snapshots_hash_unique unique (outcome_id, content_hash),
  constraint outcome_snapshots_outcome_id_id_unique unique (outcome_id, id)
);

alter table public.outcomes
  add constraint outcomes_current_snapshot_fk
  foreign key (id, current_snapshot_id)
  references public.outcome_snapshots(outcome_id, id)
  deferrable initially deferred;

create index outcomes_status_created_idx on public.outcomes (status, created_at desc);
create index outcome_snapshots_outcome_created_idx on public.outcome_snapshots (outcome_id, created_at desc);

create trigger outcome_sources_set_updated_at before update on public.outcome_sources
for each row execute function public.set_updated_at();
create trigger outcomes_set_updated_at before update on public.outcomes
for each row execute function public.set_updated_at();

create table public.outcome_copy_events (
  id bigint generated always as identity primary key,
  outcome_id uuid not null references public.outcomes(id) on delete cascade,
  visitor_hash text not null,
  copied_on date not null default current_date,
  created_at timestamptz not null default now(),
  constraint outcome_copy_events_visitor_hash check (visitor_hash ~ '^[0-9a-f]{64}$'),
  constraint outcome_copy_events_daily_unique unique (outcome_id, visitor_hash, copied_on)
);

create table public.outcome_reviews (
  id uuid primary key default gen_random_uuid(),
  outcome_id uuid not null references public.outcomes(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text check (body is null or (btrim(body) <> '' and char_length(body) <= 1000)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint outcome_reviews_one_per_user unique (outcome_id, reviewer_id)
);

create trigger outcome_reviews_set_updated_at before update on public.outcome_reviews
for each row execute function public.set_updated_at();

alter table public.outcome_sources enable row level security;
alter table public.outcomes enable row level security;
alter table public.outcome_snapshots enable row level security;
alter table public.outcome_copy_events enable row level security;
alter table public.outcome_reviews enable row level security;

revoke all on public.outcome_sources, public.outcomes, public.outcome_snapshots, public.outcome_copy_events, public.outcome_reviews from public, anon, authenticated;
grant all on public.outcome_sources, public.outcomes, public.outcome_snapshots, public.outcome_copy_events, public.outcome_reviews to service_role;

-- The source, published record, and current immutable snapshot are the public
-- Outcome contract. Superseded snapshots and hidden Outcomes remain private.
create policy "Public sources with published Outcomes are readable"
on public.outcome_sources for select
to anon, authenticated
using (
  exists (
    select 1 from public.outcomes
    where outcomes.source_id = outcome_sources.id
      and outcomes.status = 'published'
  )
);

create policy "Published Outcomes are readable"
on public.outcomes for select
to anon, authenticated
using (status = 'published');

create policy "Current published Outcome snapshots are readable"
on public.outcome_snapshots for select
to anon, authenticated
using (
  exists (
    select 1 from public.outcomes
    where outcomes.id = outcome_snapshots.outcome_id
      and outcomes.status = 'published'
      and outcomes.current_snapshot_id = outcome_snapshots.id
  )
);

grant select on public.outcome_sources, public.outcomes, public.outcome_snapshots to anon, authenticated;

create view public.outcome_directory
with (security_invoker = true)
as
select
  outcomes.id,
  outcomes.slug,
  snapshots.title,
  snapshots.summary,
  snapshots.about_markdown,
  snapshots.prompt_markdown as prompt,
  snapshots.result_media_url,
  snapshots.poster_url,
  snapshots.requirements,
  snapshots.models,
  snapshots.products,
  snapshots.skills,
  snapshots.preview,
  snapshots.inputs,
  snapshots.artifacts,
  snapshots.created_at as published_at,
  outcomes.publication_kind,
  sources.source_type,
  sources.locator as source_locator,
  sources.install_url as source_url,
  snapshots.source_revision,
  snapshots.manifest_url,
  snapshots.about_url,
  snapshots.prompt_url,
  snapshots.manifest->'author'->>'name' as author_name,
  snapshots.manifest->'author'->>'url' as author_url,
  execution_model.value->>'provider' as provider,
  execution_model.value->>'model' as model,
  execution_model.value->>'agent' as agent
from public.outcomes
join public.outcome_sources sources on sources.id = outcomes.source_id
join public.outcome_snapshots snapshots on snapshots.id = outcomes.current_snapshot_id
left join lateral (
  select value
  from jsonb_array_elements(snapshots.models) as selected(value)
  where value->>'role' = 'execution'
  limit 1
) execution_model on true
where outcomes.status = 'published';

create view public.product_outcome_directory
with (security_invoker = true)
as
select
  directory.id,
  product.value as linked_product_id,
  split_part(product.value, '/', 2) as linked_product_slug,
  split_part(product.value, '/', 2) as linked_product_name,
  split_part(product.value, '/', 1) as linked_company_name
from public.outcome_directory directory
cross join lateral jsonb_array_elements_text(directory.products) as product(value);

create view public.skill_outcome_directory
with (security_invoker = true)
as
select
  directory.id,
  skill.value->>'repository' || '/' || skill.value->>'directory' as linked_skill_id,
  regexp_replace(skill.value->>'directory', '^.*/', '') as linked_skill_name,
  skill.value->>'repository' as linked_skill_repository,
  skill.value->>'directory' as linked_skill_directory,
  skill.value->>'lastReviewedCommit' as linked_skill_revision
from public.outcome_directory directory
cross join lateral jsonb_array_elements(directory.skills) as skill(value);

grant select on public.outcome_directory, public.product_outcome_directory, public.skill_outcome_directory to anon, authenticated, service_role;

create function public.record_outcome_copy(target_outcome_id uuid, client_token text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
begin
  if client_token !~ '^[0-9a-fA-F-]{16,128}$' then raise exception 'Invalid client token'; end if;
  if not exists (select 1 from public.outcomes where id = target_outcome_id and status = 'published') then return false; end if;
  insert into public.outcome_copy_events (outcome_id, visitor_hash)
  values (target_outcome_id, encode(extensions.digest(client_token, 'sha256'), 'hex'))
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  return inserted_count = 1;
end;
$$;

create function public.get_outcome_usage_counts()
returns table (outcome_id uuid, use_count bigint)
language sql stable security definer set search_path = ''
as $$
  select outcomes.id, count(events.id)::bigint
  from public.outcomes
  left join public.outcome_copy_events events on events.outcome_id = outcomes.id
  where outcomes.status = 'published'
  group by outcomes.id order by outcomes.id;
$$;

create function public.submit_outcome_review(target_outcome_id uuid, review_rating smallint, review_body text default null)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid := auth.uid(); normalized_body text := nullif(btrim(review_body), ''); review_id uuid;
begin
  if actor_id is null then raise exception 'Authentication is required'; end if;
  if review_rating < 1 or review_rating > 5 then raise exception 'Rating must be between 1 and 5'; end if;
  if normalized_body is not null and char_length(normalized_body) > 1000 then raise exception 'Review must be 1000 characters or fewer'; end if;
  if not exists (select 1 from public.outcomes where id = target_outcome_id and status = 'published') then raise exception 'A published Outcome is required'; end if;
  insert into public.outcome_reviews (outcome_id, reviewer_id, rating, body)
  values (target_outcome_id, actor_id, review_rating, normalized_body)
  on conflict (outcome_id, reviewer_id) do update set rating = excluded.rating, body = excluded.body, updated_at = now()
  returning id into review_id;
  return review_id;
end;
$$;

create function public.delete_outcome_review(target_outcome_id uuid)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare deleted_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  delete from public.outcome_reviews where outcome_id = target_outcome_id and reviewer_id = auth.uid();
  get diagnostics deleted_count = row_count;
  return deleted_count = 1;
end;
$$;

create function public.get_outcome_review_summaries(target_outcome_id uuid default null)
returns table (outcome_id uuid, average_rating numeric, review_count bigint)
language sql stable security definer set search_path = ''
as $$
  select outcomes.id, coalesce(round(avg(reviews.rating)::numeric, 1), 0), count(reviews.id)::bigint
  from public.outcomes
  left join public.outcome_reviews reviews on reviews.outcome_id = outcomes.id
  where outcomes.status = 'published' and (target_outcome_id is null or outcomes.id = target_outcome_id)
  group by outcomes.id order by outcomes.id;
$$;

create function public.get_outcome_reviews(target_outcome_id uuid, page_size integer default 20, page_offset integer default 0)
returns table (review_id uuid, rating smallint, body text, updated_at timestamptz, is_mine boolean, total_count bigint)
language sql stable security definer set search_path = ''
as $$
  select reviews.id, reviews.rating, reviews.body, reviews.updated_at, reviews.reviewer_id = auth.uid(), count(*) over()::bigint
  from public.outcome_reviews reviews
  join public.outcomes on outcomes.id = reviews.outcome_id
  where reviews.outcome_id = target_outcome_id and outcomes.status = 'published'
  order by reviews.updated_at desc, reviews.id
  limit least(greatest(page_size, 1), 50) offset greatest(page_offset, 0);
$$;

revoke all on function public.record_outcome_copy(uuid, text), public.get_outcome_usage_counts(), public.submit_outcome_review(uuid, smallint, text), public.delete_outcome_review(uuid), public.get_outcome_review_summaries(uuid), public.get_outcome_reviews(uuid, integer, integer) from public;
grant execute on function public.record_outcome_copy(uuid, text), public.get_outcome_usage_counts(), public.get_outcome_review_summaries(uuid), public.get_outcome_reviews(uuid, integer, integer) to anon, authenticated, service_role;
grant execute on function public.submit_outcome_review(uuid, smallint, text), public.delete_outcome_review(uuid) to authenticated, service_role;
