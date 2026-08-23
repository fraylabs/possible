-- The source-owned registry has no hosted accounts, claims, gallery imports,
-- product editors, or publication workflows. Remove their function surface
-- after the owning tables were retired in the preceding migration.

drop function if exists public.accept_claim_transfer(uuid);
drop function if exists public.can_edit_outcome(uuid);
drop function if exists public.can_edit_product(uuid);
drop function if exists public.claim_first_platform_admin();
drop function if exists public.create_account(text, text, text);
drop function if exists public.create_company(text, text, text);
drop function if exists public.get_source_copy_rankings_7d(integer, integer);
drop function if exists public.has_account_role(uuid, text[]);
drop function if exists public.has_company_role(uuid, text[]);
drop function if exists public.import_gallery_draft(uuid, jsonb);
drop function if exists public.is_platform_admin();
drop function if exists public.protect_last_account_owner();
drop function if exists public.protect_last_company_owner();
drop function if exists public.request_claim_transfer(uuid, text);
drop function if exists public.request_listing_claim(uuid, text, uuid);
drop function if exists public.set_account_outcome_publication(uuid, uuid[], boolean);
drop function if exists public.set_outcome_official(uuid, uuid, boolean);
drop function if exists public.set_outcome_publication(uuid, uuid[], boolean);
drop function if exists public.validate_outcome_publication();
drop function if exists public.validate_published_outcome_edit();
