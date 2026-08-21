alter table public.gallery_sources
add column account_id uuid references public.accounts(id) on delete restrict;

update public.gallery_sources
set account_id = (
  select id from public.accounts where handle = 'fray-labs'
)
where account_id is null;

do $$
begin
  if exists (select 1 from public.outcomes where account_id is null) then
    raise exception 'Every existing Outcome must have an account before enforcing ownership';
  end if;
  if exists (select 1 from public.gallery_sources where account_id is null) then
    raise exception 'Every existing gallery source must have an account before enforcing ownership';
  end if;
end;
$$;

alter table public.outcomes alter column account_id set not null;
alter table public.gallery_sources alter column account_id set not null;

create index gallery_sources_account_id_idx on public.gallery_sources (account_id, created_at desc);

drop policy gallery_sources_member_read on public.gallery_sources;
drop policy gallery_sources_member_insert on public.gallery_sources;
drop policy gallery_sources_member_update on public.gallery_sources;

create policy gallery_sources_member_read
on public.gallery_sources for select
to authenticated
using (
  public.can_edit_product(product_id)
  and public.has_account_role(account_id, array['owner', 'editor'])
);

create policy gallery_sources_member_insert
on public.gallery_sources for insert
to authenticated
with check (
  public.can_edit_product(product_id)
  and public.has_account_role(account_id, array['owner', 'editor'])
);

create policy gallery_sources_member_update
on public.gallery_sources for update
to authenticated
using (
  public.can_edit_product(product_id)
  and public.has_account_role(account_id, array['owner', 'editor'])
)
with check (
  public.can_edit_product(product_id)
  and public.has_account_role(account_id, array['owner', 'editor'])
);

create or replace function public.import_gallery_draft(
  target_gallery_source_id uuid,
  import_document jsonb
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_product_id uuid;
  target_account_id uuid;
  configured_source_url text;
  imported_count integer;
begin
  select product_id, account_id, source_url
  into target_product_id, target_account_id, configured_source_url
  from public.gallery_sources
  where id = target_gallery_source_id;

  if target_product_id is null or target_account_id is null then
    raise exception 'Gallery source not found';
  end if;
  if not public.can_edit_product(target_product_id)
    or not public.has_account_role(target_account_id, array['owner', 'editor'])
  then
    raise exception 'Gallery editor access is required';
  end if;
  if jsonb_typeof(import_document) <> 'object'
    or import_document ->> 'schemaVersion' <> '1'
    or jsonb_typeof(import_document -> 'items') <> 'array'
    or jsonb_typeof(import_document -> 'warnings') <> 'array'
  then
    raise exception 'Expected a Possible gallery import document with schemaVersion 1';
  end if;
  if import_document #>> '{source,url}' is distinct from configured_source_url then
    raise exception 'Import source URL does not match the connected gallery';
  end if;

  insert into public.outcomes (
    account_id,
    product_id,
    gallery_source_id,
    source_key,
    source_url,
    source_type,
    title,
    prompt,
    result_media_url,
    poster_url,
    model,
    author_name,
    author_url,
    source_published_at,
    source_updated_at,
    origin_type,
    attribution_type
  )
  select
    target_account_id,
    target_product_id,
    target_gallery_source_id,
    item ->> 'sourceKey',
    item ->> 'sourceUrl',
    'official-gallery',
    nullif(item ->> 'title', ''),
    nullif(item ->> 'prompt', ''),
    nullif(item ->> 'resultMediaUrl', ''),
    nullif(item ->> 'posterUrl', ''),
    nullif(item ->> 'model', ''),
    nullif(item ->> 'authorName', ''),
    nullif(item ->> 'authorUrl', ''),
    case when item ->> 'sourcePublishedAt' is null then null else (item ->> 'sourcePublishedAt')::timestamptz end,
    now(),
    'gallery',
    'source'
  from jsonb_array_elements(import_document -> 'items') as item
  on conflict (gallery_source_id, source_key) do update set
    source_url = excluded.source_url,
    source_type = excluded.source_type,
    title = excluded.title,
    prompt = excluded.prompt,
    result_media_url = excluded.result_media_url,
    poster_url = excluded.poster_url,
    model = excluded.model,
    author_name = excluded.author_name,
    author_url = excluded.author_url,
    source_published_at = excluded.source_published_at,
    source_updated_at = excluded.source_updated_at;

  get diagnostics imported_count = row_count;

  insert into public.outcome_products (outcome_id, product_id)
  select id, product_id
  from public.outcomes
  where gallery_source_id = target_gallery_source_id
  on conflict do nothing;

  update public.gallery_sources
  set status = 'review', last_scanned_at = now(), last_error = null
  where id = target_gallery_source_id;

  insert into public.scan_runs (
    gallery_source_id, status, discovered_count, warning_count, started_at, finished_at
  ) values (
    target_gallery_source_id,
    'succeeded',
    imported_count,
    jsonb_array_length(import_document -> 'warnings'),
    now(),
    now()
  );

  return imported_count;
end;
$$;

revoke all on function public.import_gallery_draft(uuid, jsonb) from public;
grant execute on function public.import_gallery_draft(uuid, jsonb) to authenticated;
