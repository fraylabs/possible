alter table public.outcomes
  add column source_type text,
  add column preview_description text,
  add constraint outcomes_source_type check (
    source_type is null or source_type in ('official-gallery', 'official-example', 'community')
  ),
  add constraint outcomes_preview_description_present check (
    preview_description is null or btrim(preview_description) <> ''
  );

drop view public.outcome_review;
create view public.outcome_review
with (security_invoker = true)
as
select
  outcomes.id,
  outcomes.account_id,
  accounts.handle as account_handle,
  accounts.name as account_name,
  outcomes.product_id,
  outcomes.gallery_source_id,
  outcomes.source_key,
  outcomes.source_url,
  outcomes.source_type,
  outcomes.slug,
  coalesce(outcome_edits.title, outcomes.title) as title,
  outcomes.summary,
  outcomes.original_prompt,
  coalesce(outcome_edits.prompt, outcomes.prompt) as prompt,
  outcomes.preview_description,
  coalesce(outcome_edits.result_media_url, outcomes.result_media_url) as result_media_url,
  coalesce(outcome_edits.poster_url, outcomes.poster_url) as poster_url,
  outcomes.provider,
  outcomes.agent,
  coalesce(outcome_edits.model, outcomes.model) as model,
  outcomes.execution_timestamp,
  coalesce(outcome_edits.author_name, outcomes.author_name) as author_name,
  coalesce(outcome_edits.author_url, outcomes.author_url) as author_url,
  outcomes.origin_type,
  outcomes.attribution_type,
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
left join public.accounts on accounts.id = outcomes.account_id
left join public.outcome_edits on outcome_edits.outcome_id = outcomes.id
where outcomes.status <> 'removed';

drop view public.product_outcome_directory;
drop view public.outcome_directory;
create view public.outcome_directory
with (security_invoker = true)
as
select
  outcomes.id,
  outcomes.slug,
  outcomes.source_url,
  outcomes.source_type,
  coalesce(outcome_edits.title, outcomes.title) as title,
  outcomes.summary,
  outcomes.original_prompt,
  coalesce(outcome_edits.prompt, outcomes.prompt) as prompt,
  outcomes.preview_description,
  coalesce(outcome_edits.result_media_url, outcomes.result_media_url) as result_media_url,
  coalesce(outcome_edits.poster_url, outcomes.poster_url) as poster_url,
  outcomes.provider,
  outcomes.agent,
  coalesce(outcome_edits.model, outcomes.model) as model,
  outcomes.execution_timestamp,
  coalesce(outcome_edits.author_name, outcomes.author_name) as author_name,
  coalesce(outcome_edits.author_url, outcomes.author_url) as author_url,
  outcomes.source_published_at,
  outcomes.origin_type,
  outcomes.attribution_type,
  accounts.id as account_id,
  accounts.handle as account_handle,
  accounts.name as account_name,
  products.id as product_id,
  products.slug as product_slug,
  products.name as product_name,
  products.verification_status as product_verification_status,
  companies.id as company_id,
  companies.slug as company_slug,
  companies.name as company_name,
  companies.verification_status as company_verification_status
from public.outcomes
left join public.accounts on accounts.id = outcomes.account_id
left join public.products on products.id = outcomes.product_id
left join public.companies on companies.id = products.company_id
left join public.outcome_edits on outcome_edits.outcome_id = outcomes.id
where outcomes.status = 'published';

create view public.product_outcome_directory
with (security_invoker = true)
as
select
  directory.*,
  linked_products.id as linked_product_id,
  linked_products.slug as linked_product_slug,
  linked_products.name as linked_product_name,
  linked_companies.id as linked_company_id,
  linked_companies.slug as linked_company_slug,
  linked_companies.name as linked_company_name
from public.outcome_directory directory
join public.outcome_products on outcome_products.outcome_id = directory.id
join public.products linked_products on linked_products.id = outcome_products.product_id
join public.companies linked_companies on linked_companies.id = linked_products.company_id
where linked_products.status = 'published';

grant select on public.outcome_review to authenticated;
grant select on public.outcome_directory to anon, authenticated, service_role;
grant select on public.product_outcome_directory to anon, authenticated, service_role;
