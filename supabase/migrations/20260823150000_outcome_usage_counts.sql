create function public.get_outcome_usage_counts()
returns table (
  outcome_id uuid,
  use_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    outcomes.id as outcome_id,
    count(copy_events.outcome_id)::bigint as use_count
  from public.outcomes
  left join public.outcome_copy_events copy_events
    on copy_events.outcome_id = outcomes.id
  where outcomes.status = 'published'
  group by outcomes.id
  order by outcomes.id;
$$;

revoke all on function public.get_outcome_usage_counts() from public;
grant execute on function public.get_outcome_usage_counts() to anon, authenticated, service_role;
