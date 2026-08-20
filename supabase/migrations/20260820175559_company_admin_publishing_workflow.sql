drop view public.outcome_directory;

drop policy publishers_public_read on public.publishers;
drop policy publishers_owner_update on public.publishers;
drop policy publisher_members_member_read on public.publisher_members;
drop policy publisher_members_owner_insert on public.publisher_members;
drop policy publisher_members_owner_update on public.publisher_members;
drop policy publisher_members_owner_delete on public.publisher_members;
drop policy products_public_or_member_read on public.products;
drop policy products_member_insert on public.products;
drop policy products_member_update on public.products;
drop policy gallery_sources_member_read on public.gallery_sources;
drop policy gallery_sources_member_insert on public.gallery_sources;
drop policy gallery_sources_member_update on public.gallery_sources;
drop policy scan_runs_member_read on public.scan_runs;
drop policy outcomes_public_or_member_read on public.outcomes;
drop policy outcomes_member_status_update on public.outcomes;
drop policy outcome_edits_public_or_member_read on public.outcome_edits;
drop policy outcome_edits_member_insert on public.outcome_edits;
drop policy outcome_edits_member_update on public.outcome_edits;
drop policy outcome_edits_member_delete on public.outcome_edits;

drop trigger publisher_members_keep_owner on public.publisher_members;

drop function public.create_publisher(text, text, text);
drop function public.can_edit_outcome(uuid);
drop function public.can_edit_product(uuid);
drop function public.has_publisher_role(uuid, text[]);
drop function public.protect_last_publisher_owner();

alter table public.publishers rename to companies;
alter table public.publisher_members rename to company_members;
alter table public.company_members rename column publisher_id to company_id;
alter table public.products rename column publisher_id to company_id;

alter table public.companies rename constraint publishers_pkey to companies_pkey;
alter table public.companies rename constraint publishers_slug_format to companies_slug_format;
alter table public.companies rename constraint publishers_name_present to companies_name_present;
alter table public.companies rename constraint publishers_website_https to companies_website_https;
alter table public.companies rename constraint publishers_verification_status to companies_verification_status;
alter table public.companies rename constraint publishers_slug_unique to companies_slug_unique;

alter table public.company_members rename constraint publisher_members_pkey to company_members_pkey;
alter table public.company_members rename constraint publisher_members_publisher_id_fkey to company_members_company_id_fkey;
alter table public.company_members rename constraint publisher_members_user_id_fkey to company_members_user_id_fkey;
alter table public.company_members rename constraint publisher_members_role to company_members_role;

alter table public.products rename constraint products_publisher_id_fkey to products_company_id_fkey;
alter table public.products rename constraint products_publisher_slug_unique to products_company_slug_unique;
alter index public.products_publisher_id_idx rename to products_company_id_idx;

alter trigger publishers_set_updated_at on public.companies rename to companies_set_updated_at;

alter table public.products
add column verification_status text not null default 'unverified',
add constraint products_verification_status check (verification_status in ('unverified', 'verified'));

create table public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_admins
    where user_id = auth.uid()
  );
$$;

create function public.claim_first_platform_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then
    raise exception 'Authentication is required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('possible:first-platform-admin', 0));

  if not exists (select 1 from public.platform_admins) then
    insert into public.platform_admins (user_id) values (actor_id);
  elsif not exists (select 1 from public.platform_admins where user_id = actor_id) then
    raise exception 'The initial Possible administrator has already been claimed';
  end if;

  return true;
end;
$$;

create function public.has_company_role(target_company_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.company_members
    where company_id = target_company_id
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
      and public.has_company_role(company_id, array['owner', 'editor'])
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

create function public.create_company(
  company_name text,
  company_slug text,
  company_website_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  new_company_id uuid;
begin
  if actor_id is null then
    raise exception 'Authentication is required';
  end if;
  if not public.is_platform_admin() then
    raise exception 'Possible administrator access is required';
  end if;

  insert into public.companies (name, slug, website_url)
  values (company_name, company_slug, company_website_url)
  returning id into new_company_id;

  insert into public.company_members (company_id, user_id, role)
  values (new_company_id, actor_id, 'owner');

  return new_company_id;
end;
$$;

create function public.protect_last_company_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'owner' then
    if tg_op = 'DELETE' or (tg_op = 'UPDATE' and new.role <> 'owner') then
      if (
        select count(*)
        from public.company_members
        where company_id = old.company_id and role = 'owner'
      ) <= 1 then
        raise exception 'A company must retain at least one owner';
      end if;
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger company_members_keep_owner
before update of role or delete on public.company_members
for each row execute function public.protect_last_company_owner();

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
  products.verification_status as product_verification_status,
  companies.id as company_id,
  companies.slug as company_slug,
  companies.name as company_name,
  companies.verification_status as company_verification_status
from public.outcomes
join public.products on products.id = outcomes.product_id
join public.companies on companies.id = products.company_id
left join public.outcome_edits on outcome_edits.outcome_id = outcomes.id
where outcomes.status = 'published'
  and products.status = 'published';

alter table public.platform_admins enable row level security;

create policy platform_admins_self_read
on public.platform_admins for select
to authenticated
using (user_id = auth.uid());

create policy companies_public_read
on public.companies for select
to anon, authenticated
using (
  public.has_company_role(id, array['owner', 'editor'])
  or exists (
    select 1 from public.products
    where products.company_id = companies.id
      and products.status = 'published'
  )
);

create policy companies_owner_update
on public.companies for update
to authenticated
using (public.has_company_role(id, array['owner']))
with check (public.has_company_role(id, array['owner']));

create policy company_members_member_read
on public.company_members for select
to authenticated
using (public.has_company_role(company_id, array['owner', 'editor']));

create policy company_members_owner_insert
on public.company_members for insert
to authenticated
with check (public.has_company_role(company_id, array['owner']));

create policy company_members_owner_update
on public.company_members for update
to authenticated
using (public.has_company_role(company_id, array['owner']))
with check (public.has_company_role(company_id, array['owner']));

create policy company_members_owner_delete
on public.company_members for delete
to authenticated
using (public.has_company_role(company_id, array['owner']));

create policy products_public_or_member_read
on public.products for select
to anon, authenticated
using (
  status = 'published'
  or public.has_company_role(company_id, array['owner', 'editor'])
);

create policy products_member_insert
on public.products for insert
to authenticated
with check (public.has_company_role(company_id, array['owner', 'editor']));

create policy products_member_update
on public.products for update
to authenticated
using (public.has_company_role(company_id, array['owner', 'editor']))
with check (public.has_company_role(company_id, array['owner', 'editor']));

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
with check (updated_by = auth.uid() and public.can_edit_outcome(outcome_id));

create policy outcome_edits_member_update
on public.outcome_edits for update
to authenticated
using (public.can_edit_outcome(outcome_id))
with check (updated_by = auth.uid() and public.can_edit_outcome(outcome_id));

create policy outcome_edits_member_delete
on public.outcome_edits for delete
to authenticated
using (public.can_edit_outcome(outcome_id));

revoke all on public.platform_admins from anon, authenticated;
revoke all on public.companies from anon, authenticated;
revoke all on public.company_members from anon, authenticated;
revoke all on public.products from anon, authenticated;
revoke all on public.gallery_sources from anon, authenticated;
revoke all on public.scan_runs from anon, authenticated;
revoke all on public.outcomes from anon, authenticated;
revoke all on public.outcome_edits from anon, authenticated;

grant select on public.platform_admins to authenticated;
grant select on public.companies to anon, authenticated;
grant update (name, slug, website_url) on public.companies to authenticated;
grant select, insert, update, delete on public.company_members to authenticated;
grant select on public.products to anon, authenticated;
grant insert, update on public.products to authenticated;
grant select, insert, update on public.gallery_sources to authenticated;
grant select on public.scan_runs to authenticated;
grant select on public.outcomes to anon, authenticated;
grant update (status) on public.outcomes to authenticated;
grant select on public.outcome_edits to anon, authenticated;
grant insert, update, delete on public.outcome_edits to authenticated;
grant select on public.outcome_directory to anon, authenticated;

grant all on public.platform_admins to service_role;
grant all on public.companies to service_role;
grant all on public.company_members to service_role;
grant all on public.products to service_role;
grant all on public.gallery_sources to service_role;
grant all on public.scan_runs to service_role;
grant all on public.outcomes to service_role;
grant all on public.outcome_edits to service_role;
grant select on public.outcome_directory to service_role;

revoke all on function public.is_platform_admin() from public;
revoke all on function public.claim_first_platform_admin() from public;
revoke all on function public.has_company_role(uuid, text[]) from public;
revoke all on function public.can_edit_product(uuid) from public;
revoke all on function public.can_edit_outcome(uuid) from public;
revoke all on function public.create_company(text, text, text) from public;
revoke all on function public.protect_last_company_owner() from public;

grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.claim_first_platform_admin() to authenticated;
grant execute on function public.has_company_role(uuid, text[]) to anon, authenticated;
grant execute on function public.can_edit_product(uuid) to authenticated;
grant execute on function public.can_edit_outcome(uuid) to authenticated;
grant execute on function public.create_company(text, text, text) to authenticated;
