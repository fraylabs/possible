create table public.outcome_publication_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  action text not null,
  outcome_ids uuid[] not null,
  changed_count integer not null,
  published_count integer not null,
  product_status text not null,
  correlation_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  constraint outcome_publication_events_action check (action in ('publish', 'unpublish')),
  constraint outcome_publication_events_outcomes_present check (cardinality(outcome_ids) > 0),
  constraint outcome_publication_events_changed_nonnegative check (changed_count >= 0),
  constraint outcome_publication_events_published_nonnegative check (published_count >= 0)
);

create index outcome_publication_events_product_created_idx
on public.outcome_publication_events (product_id, created_at desc);

alter table public.outcome_publication_events enable row level security;

create policy outcome_publication_events_product_editor_read
on public.outcome_publication_events for select
to authenticated
using (public.can_edit_product(product_id));

revoke all on public.outcome_publication_events from anon, authenticated;
grant select on public.outcome_publication_events to authenticated;
grant all on public.outcome_publication_events to service_role;

create or replace function public.set_outcome_publication(
  target_product_id uuid,
  target_outcome_ids uuid[],
  make_public boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_product_status text;
  changed_count integer := 0;
  published_count integer := 0;
  normalized_outcome_ids uuid[];
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;
  if not public.can_edit_product(target_product_id) then
    raise exception 'Product editor access is required';
  end if;
  if coalesce(cardinality(target_outcome_ids), 0) = 0 then
    raise exception 'Select at least one Outcome';
  end if;
  if array_position(target_outcome_ids, null) is not null then
    raise exception 'Selected Outcomes must belong to the requested product';
  end if;

  select array_agg(selected.id order by selected.id)
  into normalized_outcome_ids
  from (select distinct unnest(target_outcome_ids) as id) selected;

  select status
  into current_product_status
  from public.products
  where id = target_product_id
  for update;

  if current_product_status = 'disabled' and make_public then
    raise exception 'Disabled products cannot publish Outcomes';
  end if;
  if exists (
    select 1
    from unnest(normalized_outcome_ids) as selected(id)
    left join public.outcomes on outcomes.id = selected.id
    where outcomes.id is null
      or outcomes.product_id <> target_product_id
      or outcomes.status = 'removed'
  ) then
    raise exception 'Selected Outcomes must belong to the requested product';
  end if;
  if make_public and exists (
    select 1
    from public.outcomes
    left join public.outcome_edits on outcome_edits.outcome_id = outcomes.id
    where outcomes.id = any(normalized_outcome_ids)
      and (
        btrim(coalesce(outcome_edits.title, outcomes.title, '')) = ''
        or btrim(coalesce(outcome_edits.prompt, outcomes.prompt, '')) = ''
        or btrim(coalesce(outcome_edits.result_media_url, outcomes.result_media_url, '')) = ''
      )
  ) then
    raise exception 'Selected Outcomes require a title, prompt, and result media URL';
  end if;

  if make_public then
    update public.outcomes
    set status = 'published'
    where product_id = target_product_id
      and id = any(normalized_outcome_ids)
      and status <> 'published';
    get diagnostics changed_count = row_count;

    update public.products
    set status = 'published'
    where id = target_product_id
      and status <> 'published';
  else
    update public.outcomes
    set status = 'draft'
    where product_id = target_product_id
      and id = any(normalized_outcome_ids)
      and status = 'published';
    get diagnostics changed_count = row_count;
  end if;

  select count(*)
  into published_count
  from public.outcomes
  where product_id = target_product_id
    and status = 'published';

  if not make_public and published_count = 0 then
    update public.products
    set status = 'draft'
    where id = target_product_id
      and status = 'published';
  end if;

  select status
  into current_product_status
  from public.products
  where id = target_product_id;

  insert into public.outcome_publication_events (
    actor_id,
    product_id,
    action,
    outcome_ids,
    changed_count,
    published_count,
    product_status
  ) values (
    auth.uid(),
    target_product_id,
    case when make_public then 'publish' else 'unpublish' end,
    normalized_outcome_ids,
    changed_count,
    published_count,
    current_product_status
  );

  return jsonb_build_object(
    'updatedCount', changed_count,
    'publishedCount', published_count,
    'productStatus', current_product_status
  );
end;
$$;
