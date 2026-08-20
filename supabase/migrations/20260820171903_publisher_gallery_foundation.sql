create table public.publishers (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  website_url text,
  verification_status text not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint publishers_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint publishers_name_present check (btrim(name) <> ''),
  constraint publishers_website_https check (website_url is null or website_url ~ '^https://'),
  constraint publishers_verification_status check (verification_status in ('unverified', 'verified')),
  constraint publishers_slug_unique unique (slug)
);

create table public.publisher_members (
  publisher_id uuid not null references public.publishers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  primary key (publisher_id, user_id),
  constraint publisher_members_role check (role in ('owner', 'editor'))
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid not null references public.publishers(id) on delete restrict,
  slug text not null,
  name text not null,
  official_description text not null,
  logo_url text,
  website_url text not null,
  documentation_url text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint products_name_present check (btrim(name) <> ''),
  constraint products_description_present check (btrim(official_description) <> ''),
  constraint products_logo_https check (logo_url is null or logo_url ~ '^https://'),
  constraint products_website_https check (website_url ~ '^https://'),
  constraint products_documentation_https check (documentation_url is null or documentation_url ~ '^https://'),
  constraint products_status check (status in ('draft', 'published', 'disabled')),
  constraint products_publisher_slug_unique unique (publisher_id, slug)
);

create table public.gallery_sources (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  source_url text not null,
  status text not null default 'draft',
  auto_publish boolean not null default false,
  last_scanned_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gallery_sources_url_https check (source_url ~ '^https://'),
  constraint gallery_sources_status check (status in ('draft', 'scanning', 'review', 'active', 'paused', 'error', 'disconnected')),
  constraint gallery_sources_url_unique unique (source_url),
  constraint gallery_sources_id_product_unique unique (id, product_id)
);

create table public.scan_runs (
  id uuid primary key default gen_random_uuid(),
  gallery_source_id uuid not null references public.gallery_sources(id) on delete restrict,
  status text not null default 'queued',
  discovered_count integer not null default 0,
  warning_count integer not null default 0,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  constraint scan_runs_status check (status in ('queued', 'running', 'succeeded', 'failed')),
  constraint scan_runs_discovered_nonnegative check (discovered_count >= 0),
  constraint scan_runs_warnings_nonnegative check (warning_count >= 0),
  constraint scan_runs_time_order check (finished_at is null or started_at is null or finished_at >= started_at)
);

create table public.outcomes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  gallery_source_id uuid not null,
  source_key text not null,
  source_url text not null,
  title text,
  prompt text,
  result_media_url text,
  poster_url text,
  model text,
  author_name text,
  author_url text,
  status text not null default 'draft',
  source_published_at timestamptz,
  source_updated_at timestamptz,
  discovered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint outcomes_source_key_present check (btrim(source_key) <> ''),
  constraint outcomes_source_url_https check (source_url ~ '^https://'),
  constraint outcomes_result_media_https check (result_media_url is null or result_media_url ~ '^https://'),
  constraint outcomes_poster_https check (poster_url is null or poster_url ~ '^https://'),
  constraint outcomes_author_url_https check (author_url is null or author_url ~ '^https://'),
  constraint outcomes_status check (status in ('draft', 'ready', 'published', 'excluded', 'removed')),
  constraint outcomes_gallery_source_product_fk
    foreign key (gallery_source_id, product_id)
    references public.gallery_sources(id, product_id)
    on delete restrict,
  constraint outcomes_source_key_unique unique (gallery_source_id, source_key)
);

create table public.outcome_edits (
  outcome_id uuid primary key references public.outcomes(id) on delete cascade,
  title text,
  prompt text,
  result_media_url text,
  poster_url text,
  model text,
  author_name text,
  author_url text,
  updated_by uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  constraint outcome_edits_result_media_https check (result_media_url is null or result_media_url ~ '^https://'),
  constraint outcome_edits_poster_https check (poster_url is null or poster_url ~ '^https://'),
  constraint outcome_edits_author_url_https check (author_url is null or author_url ~ '^https://'),
  constraint outcome_edits_has_override check (
    num_nonnulls(title, prompt, result_media_url, poster_url, model, author_name, author_url) > 0
  )
);

create index products_publisher_id_idx on public.products (publisher_id);
create index gallery_sources_product_id_idx on public.gallery_sources (product_id);
create index scan_runs_gallery_source_created_idx on public.scan_runs (gallery_source_id, created_at desc);
create index outcomes_product_status_idx on public.outcomes (product_id, status);
create index outcomes_gallery_source_id_idx on public.outcomes (gallery_source_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger publishers_set_updated_at
before update on public.publishers
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger gallery_sources_set_updated_at
before update on public.gallery_sources
for each row execute function public.set_updated_at();

create trigger outcomes_set_updated_at
before update on public.outcomes
for each row execute function public.set_updated_at();

create trigger outcome_edits_set_updated_at
before update on public.outcome_edits
for each row execute function public.set_updated_at();

create function public.validate_outcome_publication()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  edits public.outcome_edits%rowtype;
begin
  if new.status = 'published' then
    select * into edits
    from public.outcome_edits
    where outcome_id = new.id;

    if btrim(coalesce(edits.title, new.title, '')) = ''
      or btrim(coalesce(edits.prompt, new.prompt, '')) = ''
      or btrim(coalesce(edits.result_media_url, new.result_media_url, '')) = ''
    then
      raise exception 'Published outcomes require a title, prompt, and result media URL';
    end if;
  end if;

  return new;
end;
$$;

create trigger outcomes_require_publishable_content
before insert or update on public.outcomes
for each row execute function public.validate_outcome_publication();

create function public.validate_published_outcome_edit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_outcome_id uuid := case when tg_op = 'DELETE' then old.outcome_id else new.outcome_id end;
  resolved_title text;
  resolved_prompt text;
  resolved_result_media_url text;
  outcome_status text;
begin
  select
    outcomes.status,
    coalesce(outcome_edits.title, outcomes.title),
    coalesce(outcome_edits.prompt, outcomes.prompt),
    coalesce(outcome_edits.result_media_url, outcomes.result_media_url)
  into outcome_status, resolved_title, resolved_prompt, resolved_result_media_url
  from public.outcomes
  left join public.outcome_edits on outcome_edits.outcome_id = outcomes.id
  where outcomes.id = target_outcome_id;

  if outcome_status = 'published'
    and (
      btrim(coalesce(resolved_title, '')) = ''
      or btrim(coalesce(resolved_prompt, '')) = ''
      or btrim(coalesce(resolved_result_media_url, '')) = ''
    )
  then
    raise exception 'Published outcomes require a title, prompt, and result media URL';
  end if;

  return coalesce(new, old);
end;
$$;

create constraint trigger outcome_edits_keep_published_content_complete
after insert or update or delete on public.outcome_edits
deferrable initially immediate
for each row execute function public.validate_published_outcome_edit();

create function public.has_publisher_role(target_publisher_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.publisher_members
    where publisher_id = target_publisher_id
      and user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

create function public.can_edit_product(target_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.products
    where id = target_product_id
      and public.has_publisher_role(publisher_id, array['owner', 'editor'])
  );
$$;

create function public.can_edit_outcome(target_outcome_id uuid)
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
      and public.can_edit_product(product_id)
  );
$$;

create function public.create_publisher(
  publisher_name text,
  publisher_slug text,
  publisher_website_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  new_publisher_id uuid;
begin
  if actor_id is null then
    raise exception 'Authentication is required';
  end if;

  insert into public.publishers (name, slug, website_url)
  values (publisher_name, publisher_slug, publisher_website_url)
  returning id into new_publisher_id;

  insert into public.publisher_members (publisher_id, user_id, role)
  values (new_publisher_id, actor_id, 'owner');

  return new_publisher_id;
end;
$$;

create function public.protect_last_publisher_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'owner'
    and (tg_op = 'DELETE' or new.role <> 'owner')
    and (
      select count(*)
      from public.publisher_members
      where publisher_id = old.publisher_id and role = 'owner'
    ) <= 1
  then
    raise exception 'A publisher must retain at least one owner';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger publisher_members_keep_owner
before update of role or delete on public.publisher_members
for each row execute function public.protect_last_publisher_owner();

create view public.outcome_directory
with (security_invoker = true)
as
select
  outcomes.id,
  outcomes.source_url,
  coalesce(outcome_edits.title, outcomes.title) as title,
  coalesce(outcome_edits.prompt, outcomes.prompt) as prompt,
  coalesce(outcome_edits.result_media_url, outcomes.result_media_url) as result_media_url,
  coalesce(outcome_edits.poster_url, outcomes.poster_url) as poster_url,
  coalesce(outcome_edits.model, outcomes.model) as model,
  coalesce(outcome_edits.author_name, outcomes.author_name) as author_name,
  coalesce(outcome_edits.author_url, outcomes.author_url) as author_url,
  outcomes.source_published_at,
  products.id as product_id,
  products.slug as product_slug,
  products.name as product_name,
  publishers.id as publisher_id,
  publishers.slug as publisher_slug,
  publishers.name as publisher_name,
  publishers.verification_status as publisher_verification_status
from public.outcomes
join public.products on products.id = outcomes.product_id
join public.publishers on publishers.id = products.publisher_id
left join public.outcome_edits on outcome_edits.outcome_id = outcomes.id
where outcomes.status = 'published'
  and products.status = 'published';

alter table public.publishers enable row level security;
alter table public.publisher_members enable row level security;
alter table public.products enable row level security;
alter table public.gallery_sources enable row level security;
alter table public.scan_runs enable row level security;
alter table public.outcomes enable row level security;
alter table public.outcome_edits enable row level security;

create policy publishers_public_read
on public.publishers for select
to anon, authenticated
using (
  public.has_publisher_role(id, array['owner', 'editor'])
  or exists (
    select 1 from public.products
    where products.publisher_id = publishers.id
      and products.status = 'published'
  )
);

create policy publishers_owner_update
on public.publishers for update
to authenticated
using (public.has_publisher_role(id, array['owner']))
with check (public.has_publisher_role(id, array['owner']));

create policy publisher_members_member_read
on public.publisher_members for select
to authenticated
using (public.has_publisher_role(publisher_id, array['owner', 'editor']));

create policy publisher_members_owner_insert
on public.publisher_members for insert
to authenticated
with check (public.has_publisher_role(publisher_id, array['owner']));

create policy publisher_members_owner_update
on public.publisher_members for update
to authenticated
using (public.has_publisher_role(publisher_id, array['owner']))
with check (public.has_publisher_role(publisher_id, array['owner']));

create policy publisher_members_owner_delete
on public.publisher_members for delete
to authenticated
using (public.has_publisher_role(publisher_id, array['owner']));

create policy products_public_or_member_read
on public.products for select
to anon, authenticated
using (
  status = 'published'
  or public.has_publisher_role(publisher_id, array['owner', 'editor'])
);

create policy products_member_insert
on public.products for insert
to authenticated
with check (public.has_publisher_role(publisher_id, array['owner', 'editor']));

create policy products_member_update
on public.products for update
to authenticated
using (public.has_publisher_role(publisher_id, array['owner', 'editor']))
with check (public.has_publisher_role(publisher_id, array['owner', 'editor']));

create policy gallery_sources_member_read
on public.gallery_sources for select
to authenticated
using (public.can_edit_product(product_id));

create policy gallery_sources_member_insert
on public.gallery_sources for insert
to authenticated
with check (public.can_edit_product(product_id));

create policy gallery_sources_member_update
on public.gallery_sources for update
to authenticated
using (public.can_edit_product(product_id))
with check (public.can_edit_product(product_id));

create policy scan_runs_member_read
on public.scan_runs for select
to authenticated
using (
  exists (
    select 1
    from public.gallery_sources
    where gallery_sources.id = scan_runs.gallery_source_id
      and public.can_edit_product(gallery_sources.product_id)
  )
);

create policy outcomes_public_or_member_read
on public.outcomes for select
to anon, authenticated
using (
  (
    status = 'published'
    and exists (
      select 1
      from public.products
      where products.id = outcomes.product_id
        and products.status = 'published'
    )
  )
  or public.can_edit_product(product_id)
);

create policy outcomes_member_status_update
on public.outcomes for update
to authenticated
using (public.can_edit_product(product_id))
with check (public.can_edit_product(product_id));

create policy outcome_edits_public_or_member_read
on public.outcome_edits for select
to anon, authenticated
using (
  exists (
    select 1
    from public.outcomes
    where outcomes.id = outcome_edits.outcome_id
      and (outcomes.status = 'published' or public.can_edit_product(outcomes.product_id))
  )
);

create policy outcome_edits_member_insert
on public.outcome_edits for insert
to authenticated
with check (
  updated_by = auth.uid()
  and public.can_edit_outcome(outcome_id)
);

create policy outcome_edits_member_update
on public.outcome_edits for update
to authenticated
using (public.can_edit_outcome(outcome_id))
with check (
  updated_by = auth.uid()
  and public.can_edit_outcome(outcome_id)
);

create policy outcome_edits_member_delete
on public.outcome_edits for delete
to authenticated
using (public.can_edit_outcome(outcome_id));

revoke all on public.publishers from anon, authenticated;
revoke all on public.publisher_members from anon, authenticated;
revoke all on public.products from anon, authenticated;
revoke all on public.gallery_sources from anon, authenticated;
revoke all on public.scan_runs from anon, authenticated;
revoke all on public.outcomes from anon, authenticated;
revoke all on public.outcome_edits from anon, authenticated;

grant select on public.publishers to anon, authenticated;
grant update (name, slug, website_url) on public.publishers to authenticated;
grant select, insert, update, delete on public.publisher_members to authenticated;
grant select on public.products to anon, authenticated;
grant insert, update on public.products to authenticated;
grant select, insert, update on public.gallery_sources to authenticated;
grant select on public.scan_runs to authenticated;
grant select on public.outcomes to anon, authenticated;
grant update (status) on public.outcomes to authenticated;
grant select on public.outcome_edits to anon, authenticated;
grant insert, update, delete on public.outcome_edits to authenticated;
grant select on public.outcome_directory to anon, authenticated;

grant all on public.publishers to service_role;
grant all on public.publisher_members to service_role;
grant all on public.products to service_role;
grant all on public.gallery_sources to service_role;
grant all on public.scan_runs to service_role;
grant all on public.outcomes to service_role;
grant all on public.outcome_edits to service_role;
grant select on public.outcome_directory to service_role;

revoke all on function public.set_updated_at() from public;
revoke all on function public.validate_outcome_publication() from public;
revoke all on function public.validate_published_outcome_edit() from public;
revoke all on function public.has_publisher_role(uuid, text[]) from public;
revoke all on function public.can_edit_product(uuid) from public;
revoke all on function public.can_edit_outcome(uuid) from public;
revoke all on function public.create_publisher(text, text, text) from public;
revoke all on function public.protect_last_publisher_owner() from public;

grant execute on function public.has_publisher_role(uuid, text[]) to anon, authenticated;
grant execute on function public.can_edit_product(uuid) to authenticated;
grant execute on function public.can_edit_outcome(uuid) to authenticated;
grant execute on function public.create_publisher(text, text, text) to authenticated;
