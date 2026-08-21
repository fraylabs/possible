create view public.outcome_review
with (security_invoker = true)
as
select
  outcomes.id,
  outcomes.product_id,
  outcomes.gallery_source_id,
  outcomes.source_key,
  outcomes.source_url,
  coalesce(outcome_edits.title, outcomes.title) as title,
  coalesce(outcome_edits.prompt, outcomes.prompt) as prompt,
  coalesce(outcome_edits.result_media_url, outcomes.result_media_url) as result_media_url,
  coalesce(outcome_edits.poster_url, outcomes.poster_url) as poster_url,
  coalesce(outcome_edits.model, outcomes.model) as model,
  coalesce(outcome_edits.author_name, outcomes.author_name) as author_name,
  coalesce(outcome_edits.author_url, outcomes.author_url) as author_url,
  outcomes.status,
  outcomes.status = 'published' as is_published,
  btrim(coalesce(outcome_edits.title, outcomes.title, '')) <> ''
    and btrim(coalesce(outcome_edits.prompt, outcomes.prompt, '')) <> ''
    and btrim(coalesce(outcome_edits.result_media_url, outcomes.result_media_url, '')) <> ''
    as is_publishable,
  array_remove(array[
    case when btrim(coalesce(outcome_edits.title, outcomes.title, '')) = '' then 'title' end,
    case when btrim(coalesce(outcome_edits.prompt, outcomes.prompt, '')) = '' then 'prompt' end,
    case when btrim(coalesce(outcome_edits.result_media_url, outcomes.result_media_url, '')) = '' then 'result media' end
  ], null) as missing_fields,
  outcomes.source_published_at,
  outcomes.source_updated_at,
  outcomes.discovered_at,
  outcome_edits.outcome_id is not null as has_editorial_edits
from public.outcomes
left join public.outcome_edits on outcome_edits.outcome_id = outcomes.id
where outcomes.status <> 'removed';

grant select on public.outcome_review to authenticated, service_role;

create function public.set_outcome_publication(
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
    from (select distinct unnest(target_outcome_ids) as id) selected
    left join public.outcomes on outcomes.id = selected.id
    where outcomes.id is null or outcomes.product_id <> target_product_id
  ) then
    raise exception 'Selected Outcomes must belong to the requested product';
  end if;
  if make_public and exists (
    select 1
    from public.outcomes
    left join public.outcome_edits on outcome_edits.outcome_id = outcomes.id
    where outcomes.id = any(target_outcome_ids)
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
      and id = any(target_outcome_ids)
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
      and id = any(target_outcome_ids)
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

  return jsonb_build_object(
    'updatedCount', changed_count,
    'publishedCount', published_count,
    'productStatus', current_product_status
  );
end;
$$;

revoke all on function public.set_outcome_publication(uuid, uuid[], boolean) from public;
grant execute on function public.set_outcome_publication(uuid, uuid[], boolean) to authenticated;
