drop policy if exists "visitors_anon_insert_for_unlocked_company" on public.visitors;

revoke all on function public.company_accepts_public_visitors(uuid) from public, anon, authenticated;
grant execute on function public.company_accepts_public_visitors(uuid) to service_role;

alter function public.company_accepts_public_visitors(uuid) set search_path = public, pg_temp;
