-- Karibu VMS explicit Data API grants
--
-- Supabase is moving away from automatic public-schema Data API grants.
-- This migration opts the project into explicit future grants and declares the
-- permissions the current app expects. RLS policies still decide row-level access.

-- 1) Future objects should not be automatically exposed through the Data API.
--    Every future migration should add its own explicit GRANT statements.
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from public;

-- 2) Schema access. Object-level GRANTs below still control actual access.
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema app_private to authenticated, service_role;

-- 3) Server-side code using the service role needs full access to app tables.
--    This is used by protected Next.js API routes, billing callbacks, cleanup jobs,
--    encryption/decryption routes, and admin-only operations.
grant select, insert, update, delete on table
  public.companies,
  public.profiles,
  public.departments,
  public.gates,
  public.hosts,
  public.visitors,
  public.red_flags,
  public.support_tickets,
  public.transactions,
  public.billing_usage,
  public.audit_logs
  to service_role;

-- 4) Authenticated browser/client access. RLS policies still restrict rows and roles.
grant select, insert, update on table public.companies to authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.departments to authenticated;
grant select, insert, update, delete on table public.gates to authenticated;
grant select, insert, update, delete on table public.hosts to authenticated;
grant select, insert, update on table public.visitors to authenticated;
grant select, insert, update, delete on table public.red_flags to authenticated;
grant select, insert, update on table public.support_tickets to authenticated;
grant select on table public.transactions to authenticated;
grant select on table public.billing_usage to authenticated;
grant select on table public.audit_logs to authenticated;

-- 5) Anonymous/public access. Keep this minimal.
--    Public visitor pages can read non-sensitive building setup data if needed.
--    Visitor creation should go through the Next.js registration API, not direct
--    anonymous table inserts, so visitors is intentionally not granted to anon here.
grant select on table public.companies to anon;
grant select on table public.departments to anon;
grant select on table public.gates to anon;
grant select on table public.hosts to anon;

revoke all on table public.visitors from anon;
revoke all on table public.red_flags from anon;
revoke all on table public.billing_usage from anon;
revoke all on table public.audit_logs from anon;
revoke all on table public.profiles from anon;
revoke all on table public.transactions from anon;
revoke all on table public.support_tickets from anon;

-- 6) Sequences. Most IDs are UUIDs, but keep this explicit for future serial columns.
grant usage, select on all sequences in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated;

-- 7) Helper functions used by RLS policies.
grant execute on function public.get_my_company_id() to authenticated, service_role;
grant execute on function public.get_my_role() to authenticated, service_role;
grant execute on function public.get_user_company_id() to authenticated, service_role;
grant execute on function public.get_user_role() to authenticated, service_role;

grant execute on function app_private.current_user_company_id() to authenticated, service_role;
grant execute on function app_private.current_user_role() to authenticated, service_role;

-- Keep internal/trigger-style functions away from browser roles unless explicitly needed.
revoke execute on function public.rls_auto_enable() from anon, authenticated;

-- Reload PostgREST schema cache so grants are picked up quickly.
select pg_notify('pgrst', 'reload schema');
