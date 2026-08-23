begin;

do $$
declare
  legacy_functions text[] := array[
    'accept_claim_transfer',
    'claim_first_platform_admin',
    'create_account',
    'create_company',
    'import_gallery_draft',
    'request_listing_claim',
    'set_account_outcome_publication',
    'set_outcome_official'
  ];
begin
  if exists (
    select 1
    from pg_proc functions
    join pg_namespace namespaces on namespaces.oid = functions.pronamespace
    where namespaces.nspname = 'public'
      and functions.proname = any(legacy_functions)
  ) then
    raise exception 'Legacy hosted-publisher functions must not remain';
  end if;
end;
$$;

insert into auth.users (id, email, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000951', 'reviewer@example.com', now(), now());

insert into public.outcome_sources (
  id, source_type, locator, install_url, publisher_name, current_revision
) values (
  '00000000-0000-0000-0000-000000000901',
  'github',
  'fixture/outcomes',
  'https://github.com/fixture/outcomes',
  'Fixture',
  '0123456789012345678901234567890123456789'
);

insert into public.outcomes (
  id, source_id, slug, publication_kind
) values (
  '00000000-0000-0000-0000-000000000902',
  '00000000-0000-0000-0000-000000000901',
  'source-owned-outcome',
  'community'
);

insert into public.outcome_snapshots (
  id, outcome_id, source_revision, content_hash, manifest, about_markdown,
  prompt_markdown, title, summary, requirements, models, products, skills,
  result_media_url, poster_url, manifest_url, about_url, prompt_url
) values (
  '00000000-0000-0000-0000-000000000903',
  '00000000-0000-0000-0000-000000000902',
  '0123456789012345678901234567890123456789',
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  '{"schemaVersion":3,"author":{"name":"Fixture","url":"https://example.com"}}',
  '# Source-owned Outcome\n\nA result stored at an immutable source revision.',
  'Create the fixture result.',
  'Source-owned Outcome',
  'A result stored at an immutable source revision.',
  array['One reference file'],
  '[{"provider":"OpenAI","model":"GPT-5.6","agent":"Codex","role":"execution"}]',
  '["fixture/product"]',
  '[{"repository":"fixture/outcomes","directory":"skills/example","lastReviewedCommit":"0123456789012345678901234567890123456789"}]',
  'https://example.com/result.png',
  'https://example.com/result.png',
  'https://raw.githubusercontent.com/fixture/outcomes/0123456789012345678901234567890123456789/outcomes/source-owned-outcome/outcome.json',
  'https://raw.githubusercontent.com/fixture/outcomes/0123456789012345678901234567890123456789/outcomes/source-owned-outcome/outcome.md',
  'https://raw.githubusercontent.com/fixture/outcomes/0123456789012345678901234567890123456789/outcomes/source-owned-outcome/prompt.md'
);

update public.outcomes
set current_snapshot_id = '00000000-0000-0000-0000-000000000903'
where id = '00000000-0000-0000-0000-000000000902';

insert into public.outcome_snapshots (
  id, outcome_id, source_revision, content_hash, manifest, about_markdown,
  prompt_markdown, title, summary, manifest_url, about_url, prompt_url
) values (
  '00000000-0000-0000-0000-000000000904',
  '00000000-0000-0000-0000-000000000902',
  '1111111111111111111111111111111111111111',
  'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '{"schemaVersion":3,"author":{"name":"Fixture","url":"https://example.com"}}',
  '# Superseded Outcome',
  'Old prompt.',
  'Superseded Outcome',
  'An older immutable revision.',
  'https://raw.githubusercontent.com/fixture/outcomes/1111111111111111111111111111111111111111/outcomes/source-owned-outcome/outcome.json',
  'https://raw.githubusercontent.com/fixture/outcomes/1111111111111111111111111111111111111111/outcomes/source-owned-outcome/outcome.md',
  'https://raw.githubusercontent.com/fixture/outcomes/1111111111111111111111111111111111111111/outcomes/source-owned-outcome/prompt.md'
);

do $$
begin
  if not exists (
    select 1 from public.outcome_directory
    where id = '00000000-0000-0000-0000-000000000902'
      and title = 'Source-owned Outcome'
      and prompt = 'Create the fixture result.'
      and provider = 'OpenAI'
      and source_locator = 'fixture/outcomes'
  ) then raise exception 'The current source snapshot is not publicly projected'; end if;
  if not exists (
    select 1 from public.product_outcome_directory
    where id = '00000000-0000-0000-0000-000000000902'
      and linked_product_id = 'fixture/product'
  ) then raise exception 'Product attribution is missing'; end if;
  if not exists (
    select 1 from public.skill_outcome_directory
    where id = '00000000-0000-0000-0000-000000000902'
      and linked_skill_id = 'fixture/outcomes/skills/example'
  ) then raise exception 'Skill attribution is missing'; end if;
  if not public.record_outcome_copy('00000000-0000-0000-0000-000000000902', '00000000-0000-0000-0000-000000000921') then raise exception 'First copy was not recorded'; end if;
  if public.record_outcome_copy('00000000-0000-0000-0000-000000000902', '00000000-0000-0000-0000-000000000921') then raise exception 'Duplicate daily copy was recorded'; end if;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000951', true);
select public.submit_outcome_review('00000000-0000-0000-0000-000000000902', 5::smallint, 'Clear and reusable.');

do $$
begin
  if not exists (
    select 1 from public.get_outcome_usage_counts()
    where outcome_id = '00000000-0000-0000-0000-000000000902' and use_count = 1
  ) then raise exception 'Copy aggregate is incorrect'; end if;
  if not exists (
    select 1 from public.get_outcome_review_summaries('00000000-0000-0000-0000-000000000902')
    where average_rating = 5 and review_count = 1
  ) then raise exception 'Review aggregate is incorrect'; end if;
end;
$$;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);

do $$
begin
  if not exists (
    select 1 from public.outcome_snapshots
    where id = '00000000-0000-0000-0000-000000000903'
  ) then raise exception 'Anonymous readers cannot read the current public snapshot'; end if;
  if exists (
    select 1 from public.outcome_snapshots
    where id = '00000000-0000-0000-0000-000000000904'
  ) then raise exception 'Anonymous readers can read a superseded snapshot'; end if;
  if not exists (select 1 from public.outcome_directory where id = '00000000-0000-0000-0000-000000000902') then
    raise exception 'Anonymous readers cannot read the Outcome directory';
  end if;
end;
$$;

reset role;
rollback;
