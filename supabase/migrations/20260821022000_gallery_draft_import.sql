create function public.import_gallery_draft(
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
  configured_source_url text;
  imported_count integer;
begin
  select product_id, source_url
  into target_product_id, configured_source_url
  from public.gallery_sources
  where id = target_gallery_source_id;

  if target_product_id is null then
    raise exception 'Gallery source not found';
  end if;
  if not public.can_edit_product(target_product_id) then
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
    product_id,
    gallery_source_id,
    source_key,
    source_url,
    title,
    prompt,
    result_media_url,
    poster_url,
    model,
    author_name,
    author_url,
    source_published_at,
    source_updated_at
  )
  select
    target_product_id,
    target_gallery_source_id,
    item ->> 'sourceKey',
    item ->> 'sourceUrl',
    nullif(item ->> 'title', ''),
    nullif(item ->> 'prompt', ''),
    nullif(item ->> 'resultMediaUrl', ''),
    nullif(item ->> 'posterUrl', ''),
    nullif(item ->> 'model', ''),
    nullif(item ->> 'authorName', ''),
    nullif(item ->> 'authorUrl', ''),
    case when item ->> 'sourcePublishedAt' is null then null else (item ->> 'sourcePublishedAt')::timestamptz end,
    now()
  from jsonb_array_elements(import_document -> 'items') as item
  on conflict (gallery_source_id, source_key) do update set
    source_url = excluded.source_url,
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

  update public.gallery_sources
  set
    status = 'review',
    last_scanned_at = now(),
    last_error = null
  where id = target_gallery_source_id;

  insert into public.scan_runs (
    gallery_source_id,
    status,
    discovered_count,
    warning_count,
    started_at,
    finished_at
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
