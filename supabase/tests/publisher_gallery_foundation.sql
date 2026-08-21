begin;

delete from public.platform_admins;

insert into auth.users (id, email, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000901', 'admin@example.com', now(), now()),
  ('00000000-0000-0000-0000-000000000902', 'other@example.com', now(), now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000901', true);
select public.claim_first_platform_admin();
select public.create_company('Admin Company One', 'admin-company-one', 'https://example.com/one');
select public.create_company('Admin Company Two', 'admin-company-two', 'https://example.com/two');

do $$
declare
  owned_companies integer;
begin
  select count(*) into owned_companies from public.companies;
  if owned_companies <> 2 then
    raise exception 'Expected the administrator to own 2 companies, found %', owned_companies;
  end if;
end;
$$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000902', true);

do $$
begin
  begin
    perform public.claim_first_platform_admin();
    raise exception 'A second platform administrator claimed the bootstrap';
  exception
    when raise_exception then
      if sqlerrm <> 'The initial Possible administrator has already been claimed' then
        raise;
      end if;
  end;
end;
$$;

reset role;
select set_config('request.jwt.claim.sub', '', true);

do $$
begin
  begin
    insert into public.companies (slug, name) values ('Not Valid', 'Invalid');
    raise exception 'Invalid company slug was accepted';
  exception
    when check_violation then null;
  end;
end;
$$;

insert into public.companies (id, slug, name)
values ('00000000-0000-0000-0000-000000000001', 'test-publisher', 'Test Publisher');

insert into public.products (id, company_id, slug, name, official_description, website_url, status)
values
  (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    'public-product',
    'Public Product',
    'Official public product description.',
    'https://example.com/public',
    'published'
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000001',
    'draft-product',
    'Draft Product',
    'Official draft product description.',
    'https://example.com/draft',
    'draft'
  );

insert into public.gallery_sources (id, product_id, source_url)
values
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000101',
    'https://example.com/public/gallery'
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000102',
    'https://example.com/draft/gallery'
  );

insert into public.company_members (company_id, user_id, role)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000901',
  'owner'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000901', true);
select public.import_gallery_draft(
  '00000000-0000-0000-0000-000000000201',
  '{
    "schemaVersion": 1,
    "source": {"url": "https://example.com/public/gallery", "inspectedAt": "2026-08-21T00:00:00Z"},
    "company": {"name": "Test Publisher", "websiteUrl": "https://example.com"},
    "product": {"name": "Public Product", "websiteUrl": "https://example.com/public"},
    "items": [{
      "sourceKey": "imported-draft",
      "sourceUrl": "https://example.com/public/imported-draft",
      "title": "Imported draft",
      "prompt": null,
      "resultMediaUrl": null,
      "posterUrl": null,
      "model": null,
      "authorName": null,
      "authorUrl": null,
      "sourcePublishedAt": null
    }],
    "warnings": [{"itemSourceKey": "imported-draft", "field": "prompt", "message": "Prompt is not public."}]
  }'::jsonb
);

do $$
begin
  if not exists (
    select 1 from public.outcomes
    where gallery_source_id = '00000000-0000-0000-0000-000000000201'
      and source_key = 'imported-draft'
      and status = 'draft'
  ) then
    raise exception 'Gallery import did not create a private draft';
  end if;
end;
$$;

reset role;
select set_config('request.jwt.claim.sub', '', true);

do $$
begin
  begin
    insert into public.outcomes (
      product_id,
      gallery_source_id,
      source_key,
      source_url
    ) values (
      '00000000-0000-0000-0000-000000000102',
      '00000000-0000-0000-0000-000000000201',
      'wrong-product',
      'https://example.com/wrong-product'
    );
    raise exception 'Cross-product outcome was accepted';
  exception
    when foreign_key_violation then null;
  end;

  begin
    insert into public.outcomes (
      product_id,
      gallery_source_id,
      source_key,
      source_url,
      status
    ) values (
      '00000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000201',
      'incomplete',
      'https://example.com/incomplete',
      'published'
    );
    raise exception 'Incomplete published outcome was accepted';
  exception
    when raise_exception then
      if sqlerrm <> 'Published outcomes require a title, prompt, and result media URL' then
        raise;
      end if;
  end;
end;
$$;

insert into public.outcomes (
  id,
  product_id,
  gallery_source_id,
  source_key,
  source_url,
  title,
  prompt,
  result_media_url,
  status
)
values
  (
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    'public-outcome',
    'https://example.com/public/outcome',
    'Public outcome',
    'Make the public outcome.',
    'https://example.com/public/outcome.mp4',
    'published'
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000202',
    'hidden-outcome',
    'https://example.com/draft/outcome',
    'Hidden outcome',
    'Make the hidden outcome.',
    'https://example.com/draft/outcome.mp4',
    'draft'
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000902', true);

do $$
begin
  begin
    perform public.set_outcome_publication(
      '00000000-0000-0000-0000-000000000101',
      array['00000000-0000-0000-0000-000000000301']::uuid[],
      true
    );
    raise exception 'A non-member published another company Outcome';
  exception
    when raise_exception then
      if sqlerrm <> 'Product editor access is required' then
        raise;
      end if;
  end;
end;
$$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000901', true);

do $$
begin
  begin
    perform public.set_outcome_publication(
      '00000000-0000-0000-0000-000000000101',
      array['00000000-0000-0000-0000-000000000302']::uuid[],
      true
    );
    raise exception 'A cross-product Outcome was published';
  exception
    when raise_exception then
      if sqlerrm <> 'Selected Outcomes must belong to the requested product' then
        raise;
      end if;
  end;

  begin
    perform public.set_outcome_publication(
      '00000000-0000-0000-0000-000000000101',
      array[(
        select id from public.outcomes
        where gallery_source_id = '00000000-0000-0000-0000-000000000201'
          and source_key = 'imported-draft'
      )]::uuid[],
      true
    );
    raise exception 'An incomplete Outcome was published';
  exception
    when raise_exception then
      if sqlerrm <> 'Selected Outcomes require a title, prompt, and result media URL' then
        raise;
      end if;
  end;
end;
$$;

select public.set_outcome_publication(
  '00000000-0000-0000-0000-000000000102',
  array['00000000-0000-0000-0000-000000000302']::uuid[],
  true
);

do $$
begin
  if (
    select count(*)
    from public.outcome_publication_events
    where product_id = '00000000-0000-0000-0000-000000000102'
      and actor_id = '00000000-0000-0000-0000-000000000901'
      and action = 'publish'
      and changed_count = 1
  ) <> 1 then
    raise exception 'Successful publication did not emit exactly one audit event';
  end if;
  if exists (
    select 1
    from public.outcome_publication_events
    where product_id = '00000000-0000-0000-0000-000000000101'
      and actor_id = '00000000-0000-0000-0000-000000000902'
  ) then
    raise exception 'Denied publication emitted a success audit event';
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from public.outcomes
    where id = '00000000-0000-0000-0000-000000000302'
      and status = 'published'
  ) or not exists (
    select 1 from public.products
    where id = '00000000-0000-0000-0000-000000000102'
      and status = 'published'
  ) then
    raise exception 'Publishing did not expose the selected Outcome and product';
  end if;
end;
$$;

select public.set_outcome_publication(
  '00000000-0000-0000-0000-000000000102',
  array['00000000-0000-0000-0000-000000000302']::uuid[],
  false
);

do $$
begin
  if (
    select count(*)
    from public.outcome_publication_events
    where product_id = '00000000-0000-0000-0000-000000000102'
      and actor_id = '00000000-0000-0000-0000-000000000901'
      and action = 'unpublish'
      and changed_count = 1
  ) <> 1 then
    raise exception 'Successful unpublication did not emit exactly one audit event';
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from public.outcomes
    where id = '00000000-0000-0000-0000-000000000302'
      and status = 'draft'
  ) or not exists (
    select 1 from public.products
    where id = '00000000-0000-0000-0000-000000000102'
      and status = 'draft'
  ) then
    raise exception 'Unpublishing the final Outcome did not hide the product';
  end if;
end;
$$;

do $$
declare
  review_row record;
begin
  select * into review_row
  from public.outcome_review
  where id = '00000000-0000-0000-0000-000000000301';

  if review_row.title <> 'Public outcome'
    or not review_row.is_publishable
    or not review_row.is_published
    or cardinality(review_row.missing_fields) <> 0
  then
    raise exception 'Outcome review projection is inconsistent';
  end if;
end;
$$;

reset role;
select set_config('request.jwt.claim.sub', '', true);
set local role anon;

do $$
declare
  visible_products integer;
  visible_outcomes integer;
  visible_directory_entries integer;
begin
  select count(*) into visible_products from public.products;
  select count(*) into visible_outcomes from public.outcomes;
  select count(*) into visible_directory_entries from public.outcome_directory;

  if visible_products <> 1 then
    raise exception 'Expected 1 public product, found %', visible_products;
  end if;
  if visible_outcomes <> 1 then
    raise exception 'Expected 1 public outcome, found %', visible_outcomes;
  end if;
  if visible_directory_entries <> 1 then
    raise exception 'Expected 1 public directory entry, found %', visible_directory_entries;
  end if;
end;
$$;

reset role;
rollback;

select 'publisher gallery foundation verified' as result;
