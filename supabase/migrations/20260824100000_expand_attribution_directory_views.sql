create or replace view public.product_outcome_directory
with (security_invoker = true)
as
select
  directory.id,
  product.value as linked_product_id,
  split_part(product.value, '/', 2) as linked_product_slug,
  split_part(product.value, '/', 2) as linked_product_name,
  split_part(product.value, '/', 1) as linked_company_name,
  directory.slug,
  directory.title,
  directory.summary,
  directory.prompt,
  directory.result_media_url,
  directory.poster_url,
  directory.provider,
  directory.model,
  directory.author_name,
  directory.author_url,
  directory.published_at,
  directory.publication_kind,
  directory.source_url
from public.outcome_directory directory
cross join lateral jsonb_array_elements_text(directory.products) as product(value);

create or replace view public.skill_outcome_directory
with (security_invoker = true)
as
select
  directory.id,
  (skill.value->>'repository') || '/' || (skill.value->>'directory') as linked_skill_id,
  regexp_replace((skill.value->>'directory'), '^.*/', '') as linked_skill_name,
  skill.value->>'repository' as linked_skill_repository,
  skill.value->>'directory' as linked_skill_directory,
  skill.value->>'lastReviewedCommit' as linked_skill_revision,
  directory.slug,
  directory.title,
  directory.summary,
  directory.prompt,
  directory.result_media_url,
  directory.poster_url,
  directory.provider,
  directory.model,
  directory.author_name,
  directory.author_url,
  directory.published_at,
  directory.publication_kind,
  directory.source_url
from public.outcome_directory directory
cross join lateral jsonb_array_elements(directory.skills) as skill(value);

grant select on public.product_outcome_directory, public.skill_outcome_directory to anon, authenticated, service_role;
