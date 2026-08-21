create table public.listing_claims (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete restrict,
  target_type text not null,
  company_id uuid references public.companies(id) on delete restrict,
  skill_id uuid references public.skills(id) on delete restrict,
  proof_method text not null,
  proof_location text not null,
  verification_token_hash text,
  token_expires_at timestamptz,
  status text not null default 'pending',
  verified_at timestamptz,
  revoked_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listing_claims_target_type check (target_type in ('company', 'skill')),
  constraint listing_claims_target_shape check (
    (target_type = 'company' and company_id is not null and skill_id is null)
    or (target_type = 'skill' and skill_id is not null and company_id is null)
  ),
  constraint listing_claims_proof_method check (proof_method in ('dns_txt', 'github_file', 'manual')),
  constraint listing_claims_status check (status in ('pending', 'claimed', 'rejected', 'revoked')),
  constraint listing_claims_proof_location_present check (btrim(proof_location) <> ''),
  constraint listing_claims_token_shape check (
    (status = 'pending' and verification_token_hash ~ '^[0-9a-f]{64}$' and token_expires_at is not null)
    or (status <> 'pending')
  ),
  constraint listing_claims_verified_state check (
    (status = 'claimed' and verified_at is not null and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
    or status in ('pending', 'rejected')
  )
);

create unique index listing_claims_one_claimed_company
on public.listing_claims (company_id)
where status = 'claimed' and company_id is not null;

create unique index listing_claims_one_claimed_skill
on public.listing_claims (skill_id)
where status = 'claimed' and skill_id is not null;

create unique index listing_claims_one_pending_company_per_account
on public.listing_claims (account_id, company_id)
where status = 'pending' and company_id is not null;

create unique index listing_claims_one_pending_skill_per_account
on public.listing_claims (account_id, skill_id)
where status = 'pending' and skill_id is not null;

create trigger listing_claims_set_updated_at
before update on public.listing_claims
for each row execute function public.set_updated_at();

create table public.claim_transfers (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.listing_claims(id) on delete restrict,
  from_account_id uuid not null references public.accounts(id) on delete restrict,
  to_account_id uuid not null references public.accounts(id) on delete restrict,
  status text not null default 'pending',
  requested_by uuid not null references auth.users(id) on delete restrict,
  accepted_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  cancelled_at timestamptz,
  constraint claim_transfers_distinct_accounts check (from_account_id <> to_account_id),
  constraint claim_transfers_status check (status in ('pending', 'accepted', 'cancelled')),
  constraint claim_transfers_state check (
    (status = 'pending' and accepted_at is null and cancelled_at is null)
    or (status = 'accepted' and accepted_by is not null and accepted_at is not null and cancelled_at is null)
    or (status = 'cancelled' and accepted_at is null and cancelled_at is not null)
  )
);

create unique index claim_transfers_one_pending_per_claim
on public.claim_transfers (claim_id)
where status = 'pending';

create table public.outcome_endorsements (
  outcome_id uuid not null references public.outcomes(id) on delete cascade,
  claim_id uuid not null references public.listing_claims(id) on delete restrict,
  approved_by uuid not null references auth.users(id) on delete restrict,
  approved_at timestamptz not null default now(),
  primary key (outcome_id, claim_id)
);

create index outcome_endorsements_claim_id_idx
on public.outcome_endorsements (claim_id, outcome_id);

create table public.listing_claim_events (
  id bigint generated always as identity primary key,
  claim_id uuid not null references public.listing_claims(id) on delete restrict,
  actor_id uuid references auth.users(id) on delete restrict,
  action text not null,
  transfer_id uuid references public.claim_transfers(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint listing_claim_events_action check (action in ('requested', 'verified', 'rejected', 'transfer_requested', 'transferred', 'revoked'))
);

create index listing_claim_events_claim_created_idx
on public.listing_claim_events (claim_id, created_at desc);

create function public.request_listing_claim(
  target_account_id uuid,
  requested_target_type text,
  requested_target_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  raw_token text := encode(extensions.gen_random_bytes(24), 'hex');
  new_claim public.listing_claims;
  location text;
  method text;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  if not public.has_account_role(target_account_id, array['owner']) then raise exception 'Account owner access is required'; end if;
  if requested_target_type not in ('company', 'skill') then raise exception 'Claim target must be a company or skill'; end if;

  perform pg_advisory_xact_lock(hashtextextended(requested_target_type || ':' || requested_target_id::text, 0));

  if requested_target_type = 'company' then
    select '_possible.' || lower(split_part(split_part(website_url, '://', 2), '/', 1)), 'dns_txt'
      into location, method
      from public.companies where id = requested_target_id and website_url is not null;
    if location is null then raise exception 'The company needs an official website before it can be claimed'; end if;
    if exists (select 1 from public.listing_claims where company_id = requested_target_id and status = 'claimed') then raise exception 'This company is already claimed'; end if;
    update public.listing_claims set status = 'rejected'
      where account_id = target_account_id and company_id = requested_target_id and status = 'pending';
    insert into public.listing_claims (
      account_id, target_type, company_id, proof_method, proof_location,
      verification_token_hash, token_expires_at, created_by
    ) values (
      target_account_id, 'company', requested_target_id, method, location,
      encode(extensions.digest(raw_token, 'sha256'), 'hex'), now() + interval '48 hours', auth.uid()
    ) returning * into new_claim;
  else
    select repository || '/tree/HEAD/' || directory || '/possible-verification.txt', 'github_file'
      into location, method
      from public.skills where id = requested_target_id;
    if location is null then raise exception 'Skill not found'; end if;
    if exists (select 1 from public.listing_claims where skill_id = requested_target_id and status = 'claimed') then raise exception 'This Skill is already claimed'; end if;
    update public.listing_claims set status = 'rejected'
      where account_id = target_account_id and skill_id = requested_target_id and status = 'pending';
    insert into public.listing_claims (
      account_id, target_type, skill_id, proof_method, proof_location,
      verification_token_hash, token_expires_at, created_by
    ) values (
      target_account_id, 'skill', requested_target_id, method, location,
      encode(extensions.digest(raw_token, 'sha256'), 'hex'), now() + interval '48 hours', auth.uid()
    ) returning * into new_claim;
  end if;

  insert into public.listing_claim_events (claim_id, actor_id, action)
  values (new_claim.id, auth.uid(), 'requested');

  return jsonb_build_object(
    'claimId', new_claim.id,
    'targetType', new_claim.target_type,
    'proofMethod', new_claim.proof_method,
    'proofLocation', new_claim.proof_location,
    'proofValue', 'possible-site-verification=' || raw_token,
    'expiresAt', new_claim.token_expires_at
  );
end;
$$;

create function public.request_claim_transfer(target_claim_id uuid, recipient_handle text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  claim_record public.listing_claims;
  recipient_id uuid;
  transfer_id uuid;
begin
  select * into claim_record from public.listing_claims where id = target_claim_id for update;
  if claim_record.id is null or claim_record.status <> 'claimed' then raise exception 'Active claim not found'; end if;
  if not public.has_account_role(claim_record.account_id, array['owner']) then raise exception 'Account owner access is required'; end if;
  select id into recipient_id from public.accounts where handle = recipient_handle;
  if recipient_id is null then raise exception 'Receiving account not found'; end if;
  if recipient_id = claim_record.account_id then raise exception 'Choose a different receiving account'; end if;

  insert into public.claim_transfers (claim_id, from_account_id, to_account_id, requested_by)
  values (claim_record.id, claim_record.account_id, recipient_id, auth.uid())
  returning id into transfer_id;
  insert into public.listing_claim_events (claim_id, actor_id, action, transfer_id)
  values (claim_record.id, auth.uid(), 'transfer_requested', transfer_id);
  return transfer_id;
end;
$$;

create function public.accept_claim_transfer(target_transfer_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  transfer_record public.claim_transfers;
begin
  select * into transfer_record from public.claim_transfers where id = target_transfer_id for update;
  if transfer_record.id is null or transfer_record.status <> 'pending' then raise exception 'Pending transfer not found'; end if;
  if not public.has_account_role(transfer_record.to_account_id, array['owner']) then raise exception 'Receiving account owner access is required'; end if;

  update public.listing_claims set account_id = transfer_record.to_account_id where id = transfer_record.claim_id and account_id = transfer_record.from_account_id and status = 'claimed';
  if not found then raise exception 'Claim ownership changed before acceptance'; end if;
  update public.claim_transfers set status = 'accepted', accepted_by = auth.uid(), accepted_at = now() where id = transfer_record.id;
  insert into public.listing_claim_events (claim_id, actor_id, action, transfer_id)
  values (transfer_record.claim_id, auth.uid(), 'transferred', transfer_record.id);
  return true;
end;
$$;

create function public.set_outcome_official(target_outcome_id uuid, target_claim_id uuid, make_official boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  claim_record public.listing_claims;
  target_is_linked boolean;
begin
  select * into claim_record from public.listing_claims where id = target_claim_id and status = 'claimed';
  if claim_record.id is null then raise exception 'Active claim not found'; end if;
  if not public.has_account_role(claim_record.account_id, array['owner', 'editor']) then raise exception 'Claim manager access is required'; end if;

  if claim_record.target_type = 'company' then
    select exists (
      select 1 from public.outcome_products
      join public.products on products.id = outcome_products.product_id
      where outcome_products.outcome_id = target_outcome_id and products.company_id = claim_record.company_id
    ) into target_is_linked;
  else
    select exists (
      select 1 from public.outcome_skills
      where outcome_skills.outcome_id = target_outcome_id and outcome_skills.skill_id = claim_record.skill_id
    ) into target_is_linked;
  end if;
  if not target_is_linked then raise exception 'The Outcome is not linked to this claimed listing'; end if;

  if make_official then
    insert into public.outcome_endorsements (outcome_id, claim_id, approved_by)
    values (target_outcome_id, target_claim_id, auth.uid())
    on conflict (outcome_id, claim_id) do nothing;
  else
    delete from public.outcome_endorsements where outcome_id = target_outcome_id and claim_id = target_claim_id;
  end if;
  return true;
end;
$$;

create view public.listing_claim_directory
with (security_invoker = true)
as
select
  claims.id,
  claims.account_id,
  accounts.handle as account_handle,
  accounts.name as account_name,
  claims.target_type,
  claims.company_id,
  companies.slug as company_slug,
  companies.name as company_name,
  claims.skill_id,
  skills.repository as skill_repository,
  skills.directory as skill_directory,
  skills.name as skill_name,
  claims.proof_method,
  claims.proof_location,
  claims.status,
  claims.token_expires_at,
  claims.verified_at,
  claims.created_at
from public.listing_claims claims
join public.accounts on accounts.id = claims.account_id
left join public.companies on companies.id = claims.company_id
left join public.skills on skills.id = claims.skill_id
where claims.status in ('pending', 'claimed');

create view public.outcome_endorsement_directory
with (security_invoker = true)
as
select
  endorsements.outcome_id,
  claims.id as claim_id,
  claims.target_type,
  accounts.handle as official_by_handle,
  accounts.name as official_by_name,
  claims.company_id,
  claims.skill_id,
  endorsements.approved_at
from public.outcome_endorsements endorsements
join public.listing_claims claims on claims.id = endorsements.claim_id and claims.status = 'claimed'
join public.accounts on accounts.id = claims.account_id
join public.outcomes on outcomes.id = endorsements.outcome_id
where outcomes.status = 'published';

alter table public.listing_claims enable row level security;
alter table public.claim_transfers enable row level security;
alter table public.outcome_endorsements enable row level security;
alter table public.listing_claim_events enable row level security;

create policy listing_claims_public_or_manager_read
on public.listing_claims for select
to anon, authenticated
using (status = 'claimed' or public.has_account_role(account_id, array['owner', 'editor']));

create policy claim_transfers_participant_read
on public.claim_transfers for select
to authenticated
using (public.has_account_role(from_account_id, array['owner']) or public.has_account_role(to_account_id, array['owner']));

create policy outcome_endorsements_public_read
on public.outcome_endorsements for select
to anon, authenticated
using (exists (select 1 from public.outcomes where outcomes.id = outcome_id and outcomes.status = 'published'));

create policy listing_claim_events_manager_read
on public.listing_claim_events for select
to authenticated
using (exists (select 1 from public.listing_claims where listing_claims.id = claim_id and public.has_account_role(listing_claims.account_id, array['owner', 'editor'])));

revoke all on public.listing_claims, public.claim_transfers, public.outcome_endorsements, public.listing_claim_events from anon, authenticated;
grant select (id, account_id, target_type, company_id, skill_id, proof_method, proof_location, token_expires_at, status, verified_at, created_at, updated_at) on public.listing_claims to anon, authenticated;
grant select on public.claim_transfers to authenticated;
grant select on public.outcome_endorsements to anon, authenticated;
grant select on public.listing_claim_events to authenticated;
grant select on public.listing_claim_directory to anon, authenticated;
grant select on public.outcome_endorsement_directory to anon, authenticated;

grant all on public.listing_claims, public.claim_transfers, public.outcome_endorsements, public.listing_claim_events to service_role;
grant select on public.listing_claim_directory, public.outcome_endorsement_directory to service_role;

revoke all on function public.request_listing_claim(uuid, text, uuid) from public;
revoke all on function public.request_claim_transfer(uuid, text) from public;
revoke all on function public.accept_claim_transfer(uuid) from public;
revoke all on function public.set_outcome_official(uuid, uuid, boolean) from public;
grant execute on function public.request_listing_claim(uuid, text, uuid) to authenticated;
grant execute on function public.request_claim_transfer(uuid, text) to authenticated;
grant execute on function public.accept_claim_transfer(uuid) to authenticated;
grant execute on function public.set_outcome_official(uuid, uuid, boolean) to authenticated;
