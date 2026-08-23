begin;

insert into public.companies (id, slug, name, website_url)
values (
  '00000000-0000-0000-0000-000000000911',
  'ranking-company',
  'Ranking Company',
  'https://example.com'
);

insert into public.accounts (id, handle, name)
values (
  '00000000-0000-0000-0000-000000000912',
  'ranking-account',
  'Ranking Account'
);

insert into public.products (
  id,
  company_id,
  slug,
  name,
  official_description,
  website_url,
  status
) values (
  '00000000-0000-0000-0000-000000000913',
  '00000000-0000-0000-0000-000000000911',
  'ranking-product',
  'Ranking Product',
  'A fixture Product used to verify copy rankings.',
  'https://example.com/product',
  'published'
);

insert into public.gallery_sources (
  id,
  account_id,
  product_id,
  source_url
) values (
  '00000000-0000-0000-0000-000000000914',
  '00000000-0000-0000-0000-000000000912',
  '00000000-0000-0000-0000-000000000913',
  'https://example.com/gallery'
);

insert into public.outcomes (
  id,
  account_id,
  product_id,
  gallery_source_id,
  source_key,
  source_url,
  title,
  prompt,
  result_media_url,
  status
) values (
  '00000000-0000-0000-0000-000000000915',
  '00000000-0000-0000-0000-000000000912',
  '00000000-0000-0000-0000-000000000913',
  '00000000-0000-0000-0000-000000000914',
  'ranking-outcome',
  'https://example.com/outcome',
  'Ranking Outcome',
  'Make the ranking fixture.',
  'https://example.com/outcome.mp4',
  'published'
);

insert into public.outcome_products (outcome_id, product_id)
values (
  '00000000-0000-0000-0000-000000000915',
  '00000000-0000-0000-0000-000000000913'
);

insert into public.skills (id, repository, directory, name)
values (
  '00000000-0000-0000-0000-000000000916',
  'example/ranking-skill',
  'skills/ranking',
  'Ranking Skill'
);

insert into public.outcome_skills (outcome_id, skill_id, last_reviewed_commit)
values (
  '00000000-0000-0000-0000-000000000915',
  '00000000-0000-0000-0000-000000000916',
  '1111111111111111111111111111111111111111'
);

do $$
begin
  if not public.record_outcome_copy(
    '00000000-0000-0000-0000-000000000915',
    '00000000-0000-0000-0000-000000000921'
  ) then
    raise exception 'The first successful copy was not recorded';
  end if;

  if public.record_outcome_copy(
    '00000000-0000-0000-0000-000000000915',
    '00000000-0000-0000-0000-000000000921'
  ) then
    raise exception 'A repeated same-day copy from one visitor was counted twice';
  end if;

  if not public.record_outcome_copy(
    '00000000-0000-0000-0000-000000000915',
    '00000000-0000-0000-0000-000000000922'
  ) then
    raise exception 'A distinct visitor copy was not recorded';
  end if;

  if public.record_outcome_copy(
    '00000000-0000-0000-0000-000000000999',
    '00000000-0000-0000-0000-000000000923'
  ) then
    raise exception 'A missing Outcome copy was recorded';
  end if;

  if not exists (
    select 1
    from public.get_source_copy_rankings_7d(10, 0)
    where source_type = 'product'
      and source_name = 'Ranking Product'
      and copy_count = 2
      and total_count = 2
  ) then
    raise exception 'The Product ranking did not aggregate the two unique copies';
  end if;

  if not exists (
    select 1
    from public.get_source_copy_rankings_7d(10, 0)
    where source_type = 'skill'
      and source_name = 'Ranking Skill'
      and copy_count = 2
      and total_count = 2
  ) then
    raise exception 'The Skill ranking did not aggregate the two unique copies';
  end if;
end;
$$;

set local role anon;

do $$
begin
  begin
    perform * from public.outcome_copy_events;
    raise exception 'Anonymous readers can inspect raw copy events';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;
rollback;
