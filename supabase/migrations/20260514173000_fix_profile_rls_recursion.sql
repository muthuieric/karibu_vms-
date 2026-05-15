create or replace function public.get_my_company_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select p.company_id
  from public.profiles as p
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select p.role::text
  from public.profiles as p
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.get_user_company_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select p.company_id
  from public.profiles as p
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select p.role
  from public.profiles as p
  where p.id = auth.uid()
  limit 1;
$$;

alter function public.get_my_company_id() owner to postgres;
alter function public.get_my_role() owner to postgres;
alter function public.get_user_company_id() owner to postgres;
alter function public.get_user_role() owner to postgres;

grant execute on function public.get_my_company_id() to anon, authenticated, service_role;
grant execute on function public.get_my_role() to anon, authenticated, service_role;
grant execute on function public.get_user_company_id() to anon, authenticated, service_role;
grant execute on function public.get_user_role() to anon, authenticated, service_role;
