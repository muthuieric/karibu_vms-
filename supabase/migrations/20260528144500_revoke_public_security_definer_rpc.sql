-- Fix Supabase Security Advisor warning:
-- Signed-In Users Can Execute SECURITY DEFINER Function
--
-- These old helper functions live in the exposed public schema.
-- The app now uses app_private.current_user_company_id()
-- and app_private.current_user_role() in RLS policies instead.

revoke execute on function public.get_my_company_id() from public, anon, authenticated, service_role;
revoke execute on function public.get_my_role() from public, anon, authenticated, service_role;
revoke execute on function public.get_user_company_id() from public, anon, authenticated, service_role;
revoke execute on function public.get_user_role() from public, anon, authenticated, service_role;

-- Keep the private helper functions available for RLS policies.
grant execute on function app_private.current_user_company_id() to authenticated, service_role;
grant execute on function app_private.current_user_role() to authenticated, service_role;

select pg_notify('pgrst', 'reload schema');
