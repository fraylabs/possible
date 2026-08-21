create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  handle text not null,
  name text not null,
  website_url text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_handle_format check (handle ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint accounts_name_present check (btrim(name) <> ''),
  constraint accounts_website_https check (website_url is null or website_url ~ '^https://'),
  constraint accounts_avatar_https check (avatar_url is null or avatar_url ~ '^https://'),
  constraint accounts_handle_unique unique (handle)
);

create table public.account_members (
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  primary key (account_id, user_id),
  constraint account_members_role check (role in ('owner', 'editor'))
);

create trigger accounts_set_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

alter table public.outcomes
  add column account_id uuid references public.accounts(id) on delete restrict,
  add column slug text,
  add column summary text,
  add column original_prompt text,
  add column provider text,
  add column agent text,
  add column execution_timestamp timestamptz,
  add column origin_type text not null default 'gallery',
  add column attribution_type text not null default 'source';

alter table public.outcomes
  alter column product_id drop not null,
  alter column gallery_source_id drop not null,
  drop constraint outcomes_result_media_https,
  drop constraint outcomes_poster_https,
  add constraint outcomes_slug_format check (slug is null or slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  add constraint outcomes_summary_present check (summary is null or btrim(summary) <> ''),
  add constraint outcomes_provider_present check (provider is null or btrim(provider) <> ''),
  add constraint outcomes_origin_type check (origin_type in ('gallery', 'account')),
  add constraint outcomes_attribution_type check (attribution_type in ('source', 'account')),
  add constraint outcomes_origin_links check (
    (origin_type = 'gallery' and product_id is not null and gallery_source_id is not null)
    or (origin_type = 'account' and gallery_source_id is null and account_id is not null)
  ),
  add constraint outcomes_account_attribution check (attribution_type <> 'account' or account_id is not null),
  add constraint outcomes_result_media_location check (
    result_media_url is null or result_media_url ~ '^https://' or result_media_url ~ '^/outcome-media/'
  ),
  add constraint outcomes_poster_location check (
    poster_url is null or poster_url ~ '^https://' or poster_url ~ '^/outcome-media/'
  );

create unique index outcomes_account_slug_unique
on public.outcomes (account_id, slug)
where slug is not null;

create unique index outcomes_account_source_key_unique
on public.outcomes (account_id, source_key)
where origin_type = 'account';

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  repository text not null,
  directory text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint skills_repository_format check (repository ~ '^[^/[:space:]]+/[^/[:space:]]+$'),
  constraint skills_directory_present check (btrim(directory) <> '' and directory !~ '(^|/)\.\.(/|$)'),
  constraint skills_name_present check (btrim(name) <> ''),
  constraint skills_source_unique unique (repository, directory)
);

create trigger skills_set_updated_at
before update on public.skills
for each row execute function public.set_updated_at();

create table public.outcome_products (
  outcome_id uuid not null references public.outcomes(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (outcome_id, product_id)
);

insert into public.outcome_products (outcome_id, product_id)
select id, product_id from public.outcomes where product_id is not null
on conflict do nothing;

create index outcome_products_product_id_idx on public.outcome_products (product_id, outcome_id);

create table public.outcome_skills (
  outcome_id uuid not null references public.outcomes(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete restrict,
  last_reviewed_commit text not null,
  created_at timestamptz not null default now(),
  primary key (outcome_id, skill_id),
  constraint outcome_skills_commit_format check (last_reviewed_commit ~ '^[0-9a-f]{40}([0-9a-f]{24})?$')
);

create index outcome_skills_skill_id_idx on public.outcome_skills (skill_id, outcome_id);

create table public.outcome_media (
  outcome_id uuid not null references public.outcomes(id) on delete cascade,
  kind text not null,
  position smallint not null default 0,
  media_url text not null,
  poster_url text,
  alt text,
  caption text,
  format text,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (outcome_id, kind, position),
  constraint outcome_media_kind check (kind in ('image', 'video', 'audio', 'cad')),
  constraint outcome_media_position_nonnegative check (position >= 0),
  constraint outcome_media_location check (media_url ~ '^https://' or media_url ~ '^/outcome-media/'),
  constraint outcome_media_poster_location check (
    poster_url is null or poster_url ~ '^https://' or poster_url ~ '^/outcome-media/'
  ),
  constraint outcome_media_format_present check (format is null or btrim(format) <> '')
);

create function public.has_account_role(target_account_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.account_members
    where account_id = target_account_id
      and user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

create or replace function public.can_edit_outcome(target_outcome_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.outcomes
    where id = target_outcome_id
      and (
        public.has_account_role(account_id, array['owner', 'editor'])
        or (product_id is not null and public.can_edit_product(product_id))
      )
  );
$$;

create function public.create_account(
  account_name text,
  account_handle text,
  account_website_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  new_account_id uuid;
begin
  if actor_id is null then
    raise exception 'Authentication is required';
  end if;
  if not public.is_platform_admin() then
    raise exception 'Possible administrator access is required';
  end if;

  insert into public.accounts (name, handle, website_url)
  values (account_name, account_handle, account_website_url)
  returning id into new_account_id;

  insert into public.account_members (account_id, user_id, role)
  values (new_account_id, actor_id, 'owner');

  return new_account_id;
end;
$$;

create function public.protect_last_account_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'owner'
    and (tg_op = 'DELETE' or (tg_op = 'UPDATE' and new.role <> 'owner'))
    and (
      select count(*)
      from public.account_members
      where account_id = old.account_id and role = 'owner'
    ) <= 1
  then
    raise exception 'An account must retain at least one owner';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger account_members_keep_owner
before update of role or delete on public.account_members
for each row execute function public.protect_last_account_owner();

drop policy outcomes_public_or_member_read on public.outcomes;
drop policy outcomes_member_status_update on public.outcomes;

create policy outcomes_public_or_member_read
on public.outcomes for select
to anon, authenticated
using (
  status = 'published'
  or public.can_edit_outcome(id)
);

create policy outcomes_account_member_insert
on public.outcomes for insert
to authenticated
with check (
  account_id is not null
  and public.has_account_role(account_id, array['owner', 'editor'])
  and origin_type = 'account'
  and gallery_source_id is null
);

create policy outcomes_account_member_update
on public.outcomes for update
to authenticated
using (public.can_edit_outcome(id))
with check (public.can_edit_outcome(id));

alter table public.accounts enable row level security;
alter table public.account_members enable row level security;
alter table public.skills enable row level security;
alter table public.outcome_products enable row level security;
alter table public.outcome_skills enable row level security;
alter table public.outcome_media enable row level security;

create policy accounts_public_or_member_read
on public.accounts for select
to anon, authenticated
using (
  public.has_account_role(id, array['owner', 'editor'])
  or exists (
    select 1 from public.outcomes
    where outcomes.account_id = accounts.id
      and outcomes.status = 'published'
      and outcomes.attribution_type = 'account'
  )
);

create policy accounts_owner_update
on public.accounts for update
to authenticated
using (public.has_account_role(id, array['owner']))
with check (public.has_account_role(id, array['owner']));

create policy account_members_member_read
on public.account_members for select
to authenticated
using (public.has_account_role(account_id, array['owner', 'editor']));

create policy account_members_owner_insert
on public.account_members for insert
to authenticated
with check (public.has_account_role(account_id, array['owner']));

create policy account_members_owner_update
on public.account_members for update
to authenticated
using (public.has_account_role(account_id, array['owner']))
with check (public.has_account_role(account_id, array['owner']));

create policy account_members_owner_delete
on public.account_members for delete
to authenticated
using (public.has_account_role(account_id, array['owner']));

create policy skills_public_read on public.skills for select to anon, authenticated using (true);

create policy outcome_products_public_or_editor_read
on public.outcome_products for select
to anon, authenticated
using (
  exists (
    select 1 from public.outcomes
    where outcomes.id = outcome_products.outcome_id
      and (outcomes.status = 'published' or public.can_edit_outcome(outcomes.id))
  )
);

create policy outcome_products_editor_write
on public.outcome_products for all
to authenticated
using (public.can_edit_outcome(outcome_id))
with check (public.can_edit_outcome(outcome_id));

create policy outcome_skills_public_or_editor_read
on public.outcome_skills for select
to anon, authenticated
using (
  exists (
    select 1 from public.outcomes
    where outcomes.id = outcome_skills.outcome_id
      and (outcomes.status = 'published' or public.can_edit_outcome(outcomes.id))
  )
);

create policy outcome_skills_editor_write
on public.outcome_skills for all
to authenticated
using (public.can_edit_outcome(outcome_id))
with check (public.can_edit_outcome(outcome_id));

create policy outcome_media_public_or_editor_read
on public.outcome_media for select
to anon, authenticated
using (
  exists (
    select 1 from public.outcomes
    where outcomes.id = outcome_media.outcome_id
      and (outcomes.status = 'published' or public.can_edit_outcome(outcomes.id))
  )
);

create policy outcome_media_editor_write
on public.outcome_media for all
to authenticated
using (public.can_edit_outcome(outcome_id))
with check (public.can_edit_outcome(outcome_id));

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
  outcomes.slug,
  coalesce(outcome_edits.title, outcomes.title) as title,
  outcomes.summary,
  outcomes.original_prompt,
  coalesce(outcome_edits.prompt, outcomes.prompt) as prompt,
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

drop view public.outcome_directory;
create view public.outcome_directory
with (security_invoker = true)
as
select
  outcomes.id,
  outcomes.slug,
  outcomes.source_url,
  coalesce(outcome_edits.title, outcomes.title) as title,
  outcomes.summary,
  outcomes.original_prompt,
  coalesce(outcome_edits.prompt, outcomes.prompt) as prompt,
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

create view public.account_skill_directory
with (security_invoker = true)
as
select
  accounts.id as account_id,
  accounts.handle as account_handle,
  skills.id,
  skills.name,
  skills.repository,
  skills.directory,
  count(distinct outcomes.id) as outcome_count
from public.accounts
join public.outcomes on outcomes.account_id = accounts.id
  and outcomes.status = 'published'
  and outcomes.attribution_type = 'account'
join public.outcome_skills on outcome_skills.outcome_id = outcomes.id
join public.skills on skills.id = outcome_skills.skill_id
group by accounts.id, accounts.handle, skills.id, skills.name, skills.repository, skills.directory;

create view public.account_product_directory
with (security_invoker = true)
as
select
  accounts.id as account_id,
  accounts.handle as account_handle,
  products.id,
  products.slug,
  products.name,
  products.logo_url,
  companies.name as company_name,
  count(distinct outcomes.id) as outcome_count
from public.accounts
join public.outcomes on outcomes.account_id = accounts.id
  and outcomes.status = 'published'
  and outcomes.attribution_type = 'account'
join public.outcome_products on outcome_products.outcome_id = outcomes.id
join public.products on products.id = outcome_products.product_id
join public.companies on companies.id = products.company_id
group by accounts.id, accounts.handle, products.id, products.slug, products.name, products.logo_url, companies.name;

create table public.account_outcome_publication_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete restrict,
  account_id uuid not null references public.accounts(id) on delete restrict,
  action text not null,
  outcome_ids uuid[] not null,
  changed_count integer not null,
  correlation_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  constraint account_outcome_events_action check (action in ('publish', 'unpublish')),
  constraint account_outcome_events_outcomes_present check (cardinality(outcome_ids) > 0),
  constraint account_outcome_events_changed_nonnegative check (changed_count >= 0)
);

create index account_outcome_events_account_created_idx
on public.account_outcome_publication_events (account_id, created_at desc);

alter table public.account_outcome_publication_events enable row level security;

create policy account_outcome_events_member_read
on public.account_outcome_publication_events for select
to authenticated
using (public.has_account_role(account_id, array['owner', 'editor']));

create function public.set_account_outcome_publication(
  target_account_id uuid,
  target_outcome_ids uuid[],
  make_public boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed_count integer := 0;
  normalized_outcome_ids uuid[];
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  if not public.has_account_role(target_account_id, array['owner', 'editor']) then
    raise exception 'Account editor access is required';
  end if;
  if coalesce(cardinality(target_outcome_ids), 0) = 0 then raise exception 'Select at least one Outcome'; end if;
  if array_position(target_outcome_ids, null) is not null then raise exception 'Selected Outcomes must belong to the requested account'; end if;

  select array_agg(selected.id order by selected.id)
  into normalized_outcome_ids
  from (select distinct unnest(target_outcome_ids) as id) selected;

  if exists (
    select 1
    from unnest(normalized_outcome_ids) selected(id)
    left join public.outcomes on outcomes.id = selected.id
    where outcomes.id is null or outcomes.account_id <> target_account_id or outcomes.status = 'removed'
  ) then
    raise exception 'Selected Outcomes must belong to the requested account';
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

  update public.outcomes
  set status = case when make_public then 'published' else 'draft' end
  where account_id = target_account_id
    and id = any(normalized_outcome_ids)
    and status is distinct from case when make_public then 'published' else 'draft' end;
  get diagnostics changed_count = row_count;

  if make_public then
    update public.products
    set status = 'published'
    where id in (
      select product_id from public.outcome_products
      where outcome_id = any(normalized_outcome_ids)
    ) and status <> 'disabled';
  end if;

  insert into public.account_outcome_publication_events (
    actor_id, account_id, action, outcome_ids, changed_count
  ) values (
    auth.uid(), target_account_id,
    case when make_public then 'publish' else 'unpublish' end,
    normalized_outcome_ids, changed_count
  );

  return jsonb_build_object('updatedCount', changed_count);
end;
$$;

revoke all on public.accounts from anon, authenticated;
revoke all on public.account_members from anon, authenticated;
revoke all on public.skills from anon, authenticated;
revoke all on public.outcome_products from anon, authenticated;
revoke all on public.outcome_skills from anon, authenticated;
revoke all on public.outcome_media from anon, authenticated;
revoke all on public.account_outcome_publication_events from anon, authenticated;

grant select on public.accounts to anon, authenticated;
grant update (name, handle, website_url, avatar_url) on public.accounts to authenticated;
grant select, insert, update, delete on public.account_members to authenticated;
grant select on public.skills to anon, authenticated;
grant insert, update on public.skills to authenticated;
grant select, insert, update, delete on public.outcome_products to authenticated;
grant select, insert, update, delete on public.outcome_skills to authenticated;
grant select, insert, update, delete on public.outcome_media to authenticated;
grant select on public.account_outcome_publication_events to authenticated;
grant select on public.outcome_review to authenticated;
grant select on public.outcome_directory to anon, authenticated;
grant select on public.product_outcome_directory to anon, authenticated;
grant select on public.account_skill_directory to anon, authenticated;
grant select on public.account_product_directory to anon, authenticated;
grant insert on public.outcomes to authenticated;

grant all on public.accounts to service_role;
grant all on public.account_members to service_role;
grant all on public.skills to service_role;
grant all on public.outcome_products to service_role;
grant all on public.outcome_skills to service_role;
grant all on public.outcome_media to service_role;
grant all on public.account_outcome_publication_events to service_role;
grant select on public.product_outcome_directory to service_role;
grant select on public.account_skill_directory to service_role;
grant select on public.account_product_directory to service_role;

revoke all on function public.has_account_role(uuid, text[]) from public;
revoke all on function public.create_account(text, text, text) from public;
revoke all on function public.protect_last_account_owner() from public;
revoke all on function public.set_account_outcome_publication(uuid, uuid[], boolean) from public;

grant execute on function public.has_account_role(uuid, text[]) to anon, authenticated;
grant execute on function public.create_account(text, text, text) to authenticated;
grant execute on function public.set_account_outcome_publication(uuid, uuid[], boolean) to authenticated;
