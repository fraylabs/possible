create table public.outcome_reviews (
  id uuid primary key default gen_random_uuid(),
  outcome_id uuid not null references public.outcomes(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null,
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint outcome_reviews_one_per_user unique (outcome_id, reviewer_id),
  constraint outcome_reviews_rating_range check (rating between 1 and 5),
  constraint outcome_reviews_body_valid check (
    body is null or (btrim(body) <> '' and char_length(body) <= 1000)
  )
);

create index outcome_reviews_outcome_updated_idx
on public.outcome_reviews (outcome_id, updated_at desc);

create trigger outcome_reviews_set_updated_at
before update on public.outcome_reviews
for each row execute function public.set_updated_at();

alter table public.outcome_reviews enable row level security;

create function public.submit_outcome_review(
  target_outcome_id uuid,
  review_rating smallint,
  review_body text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  normalized_body text := nullif(btrim(review_body), '');
  review_id uuid;
begin
  if actor_id is null then
    raise exception 'Authentication is required';
  end if;
  if review_rating < 1 or review_rating > 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;
  if normalized_body is not null and char_length(normalized_body) > 1000 then
    raise exception 'Review must be 1000 characters or fewer';
  end if;
  if not exists (
    select 1 from public.outcomes
    where id = target_outcome_id and status = 'published'
  ) then
    raise exception 'A published Outcome is required';
  end if;

  insert into public.outcome_reviews (outcome_id, reviewer_id, rating, body)
  values (target_outcome_id, actor_id, review_rating, normalized_body)
  on conflict (outcome_id, reviewer_id) do update
  set rating = excluded.rating,
      body = excluded.body
  returning id into review_id;

  return review_id;
end;
$$;

create function public.delete_outcome_review(target_outcome_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  delete from public.outcome_reviews
  where outcome_id = target_outcome_id
    and reviewer_id = auth.uid();

  get diagnostics deleted_count = row_count;
  return deleted_count = 1;
end;
$$;

create function public.get_outcome_review_summaries(target_outcome_id uuid default null)
returns table (
  outcome_id uuid,
  average_rating numeric,
  review_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    outcomes.id,
    coalesce(round(avg(reviews.rating)::numeric, 1), 0) as average_rating,
    count(reviews.id)::bigint as review_count
  from public.outcomes
  left join public.outcome_reviews reviews on reviews.outcome_id = outcomes.id
  where outcomes.status = 'published'
    and (target_outcome_id is null or outcomes.id = target_outcome_id)
  group by outcomes.id
  order by outcomes.id;
$$;

create function public.get_outcome_reviews(
  target_outcome_id uuid,
  page_size integer default 20,
  page_offset integer default 0
)
returns table (
  review_id uuid,
  rating smallint,
  body text,
  updated_at timestamptz,
  is_mine boolean,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    reviews.id,
    reviews.rating,
    reviews.body,
    reviews.updated_at,
    reviews.reviewer_id = auth.uid() as is_mine,
    count(*) over()::bigint as total_count
  from public.outcome_reviews reviews
  join public.outcomes on outcomes.id = reviews.outcome_id
  where reviews.outcome_id = target_outcome_id
    and outcomes.status = 'published'
  order by reviews.updated_at desc, reviews.id
  limit least(greatest(page_size, 1), 50)
  offset greatest(page_offset, 0);
$$;

revoke all on public.outcome_reviews from public, anon, authenticated;
grant all on public.outcome_reviews to service_role;

revoke all on function public.submit_outcome_review(uuid, smallint, text) from public;
grant execute on function public.submit_outcome_review(uuid, smallint, text) to authenticated, service_role;

revoke all on function public.delete_outcome_review(uuid) from public;
grant execute on function public.delete_outcome_review(uuid) to authenticated, service_role;

revoke all on function public.get_outcome_review_summaries(uuid) from public;
grant execute on function public.get_outcome_review_summaries(uuid) to anon, authenticated, service_role;

revoke all on function public.get_outcome_reviews(uuid, integer, integer) from public;
grant execute on function public.get_outcome_reviews(uuid, integer, integer) to anon, authenticated, service_role;
