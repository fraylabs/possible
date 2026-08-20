begin;

do $$
begin
  begin
    insert into public.publishers (slug, name) values ('Not Valid', 'Invalid');
    raise exception 'Invalid publisher slug was accepted';
  exception
    when check_violation then null;
  end;
end;
$$;

insert into public.publishers (id, slug, name)
values ('00000000-0000-0000-0000-000000000001', 'test-publisher', 'Test Publisher');

insert into public.products (id, publisher_id, slug, name, official_description, website_url, status)
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
    'published'
  );

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
