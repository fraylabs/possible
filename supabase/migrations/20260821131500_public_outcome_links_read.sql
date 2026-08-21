-- Public directory views use security_invoker, so anonymous readers also need
-- select privileges on the relationship tables protected by their public-row
-- RLS policies. Write privileges remain authenticated-only.
grant select on public.outcome_products to anon;
grant select on public.outcome_skills to anon;
grant select on public.outcome_media to anon;
