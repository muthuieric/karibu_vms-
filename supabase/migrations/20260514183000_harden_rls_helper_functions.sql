create schema if not exists app_private;

revoke all on schema app_private from public;
grant usage on schema app_private to authenticated, service_role;

create or replace function app_private.current_user_company_id()
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

create or replace function app_private.current_user_role()
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

alter function app_private.current_user_company_id() owner to postgres;
alter function app_private.current_user_role() owner to postgres;

revoke all on function app_private.current_user_company_id() from public, anon;
revoke all on function app_private.current_user_role() from public, anon;
grant execute on function app_private.current_user_company_id() to authenticated, service_role;
grant execute on function app_private.current_user_role() to authenticated, service_role;

drop policy if exists "Company admins can read company profiles" on public.profiles;
drop policy if exists "Company admins can update company profiles" on public.profiles;

create policy "Company admins can read company profiles"
on public.profiles
for select
to authenticated
using (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Company admins can update company profiles"
on public.profiles
for update
to authenticated
using (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
)
with check (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

drop policy if exists "Company admins can update their company" on public.companies;
drop policy if exists "Super admins can manage companies" on public.companies;

create policy "Company admins can update their company"
on public.companies
for update
to authenticated
using (
  id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
)
with check (
  id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Super admins can manage companies"
on public.companies
for all
to authenticated
using (app_private.current_user_role() in ('super_admin', 'superadmin'))
with check (app_private.current_user_role() in ('super_admin', 'superadmin'));

drop policy if exists "Anyone can insert a visitor via QR code form" on public.visitors;
drop policy if exists "Users can view visitors for their company" on public.visitors;
drop policy if exists "Guards can add visitors for their company" on public.visitors;
drop policy if exists "Users can update visitors for their company" on public.visitors;
drop policy if exists "Super admins can manage visitors" on public.visitors;

create policy "Users can view visitors for their company"
on public.visitors
for select
to authenticated
using (
  company_id = app_private.current_user_company_id()
  or app_private.current_user_role() in ('super_admin', 'superadmin')
);

create policy "Guards can add visitors for their company"
on public.visitors
for insert
to authenticated
with check (
  company_id = app_private.current_user_company_id()
  and status = 'pending'::public.visit_status
  and app_private.current_user_role() in ('guard', 'company_admin', 'super_admin', 'superadmin')
  and (
    gate_id is null
    or exists (
      select 1
      from public.gates
      where gates.id = visitors.gate_id
        and gates.company_id = visitors.company_id
    )
  )
  and (
    host_id is null
    or exists (
      select 1
      from public.hosts
      where hosts.id = visitors.host_id
        and hosts.company_id = visitors.company_id
    )
  )
);

create policy "Users can update visitors for their company"
on public.visitors
for update
to authenticated
using (
  company_id = app_private.current_user_company_id()
  or app_private.current_user_role() in ('super_admin', 'superadmin')
)
with check (
  company_id = app_private.current_user_company_id()
  or app_private.current_user_role() in ('super_admin', 'superadmin')
);

create policy "Super admins can manage visitors"
on public.visitors
for all
to authenticated
using (app_private.current_user_role() in ('super_admin', 'superadmin'))
with check (app_private.current_user_role() in ('super_admin', 'superadmin'));

drop policy if exists "Gates company read" on public.gates;
drop policy if exists "Gates company insert" on public.gates;
drop policy if exists "Gates company update" on public.gates;
drop policy if exists "Gates company delete" on public.gates;

create policy "Gates company read"
on public.gates
for select
to authenticated
using (
  company_id = app_private.current_user_company_id()
  or app_private.current_user_role() in ('super_admin', 'superadmin')
);

create policy "Gates company insert"
on public.gates
for insert
to authenticated
with check (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Gates company update"
on public.gates
for update
to authenticated
using (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
)
with check (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Gates company delete"
on public.gates
for delete
to authenticated
using (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

drop policy if exists "Hosts company read" on public.hosts;
drop policy if exists "Hosts company insert" on public.hosts;
drop policy if exists "Hosts company update" on public.hosts;
drop policy if exists "Hosts company delete" on public.hosts;

create policy "Hosts company read"
on public.hosts
for select
to authenticated
using (
  company_id = app_private.current_user_company_id()
  or app_private.current_user_role() in ('super_admin', 'superadmin')
);

create policy "Hosts company insert"
on public.hosts
for insert
to authenticated
with check (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Hosts company update"
on public.hosts
for update
to authenticated
using (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
)
with check (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Hosts company delete"
on public.hosts
for delete
to authenticated
using (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

drop policy if exists "Departments company read" on public.departments;
drop policy if exists "Departments company insert" on public.departments;
drop policy if exists "Departments company update" on public.departments;
drop policy if exists "Departments company delete" on public.departments;

create policy "Departments company read"
on public.departments
for select
to authenticated
using (
  company_id = app_private.current_user_company_id()
  or app_private.current_user_role() in ('super_admin', 'superadmin')
);

create policy "Departments company insert"
on public.departments
for insert
to authenticated
with check (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Departments company update"
on public.departments
for update
to authenticated
using (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
)
with check (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Departments company delete"
on public.departments
for delete
to authenticated
using (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

drop policy if exists "Red flags company read" on public.red_flags;
drop policy if exists "Red flags company insert" on public.red_flags;
drop policy if exists "Red flags company update" on public.red_flags;
drop policy if exists "Red flags company delete" on public.red_flags;

create policy "Red flags company read"
on public.red_flags
for select
to authenticated
using (
  company_id = app_private.current_user_company_id()
  or app_private.current_user_role() in ('super_admin', 'superadmin')
);

create policy "Red flags company insert"
on public.red_flags
for insert
to authenticated
with check (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Red flags company update"
on public.red_flags
for update
to authenticated
using (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
)
with check (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Red flags company delete"
on public.red_flags
for delete
to authenticated
using (
  company_id = app_private.current_user_company_id()
  and app_private.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

drop policy if exists "Transactions company read" on public.transactions;

create policy "Transactions company read"
on public.transactions
for select
to authenticated
using (
  company_id = app_private.current_user_company_id()
  or app_private.current_user_role() in ('super_admin', 'superadmin')
);

alter table public.support_tickets enable row level security;

drop policy if exists "Support tickets company read" on public.support_tickets;
drop policy if exists "Support tickets company insert" on public.support_tickets;
drop policy if exists "Support tickets company update" on public.support_tickets;

create policy "Support tickets company read"
on public.support_tickets
for select
to authenticated
using (
  company_id = app_private.current_user_company_id()
  or app_private.current_user_role() in ('super_admin', 'superadmin')
);

create policy "Support tickets company insert"
on public.support_tickets
for insert
to authenticated
with check (
  company_id = app_private.current_user_company_id()
  or app_private.current_user_role() in ('super_admin', 'superadmin')
);

create policy "Support tickets company update"
on public.support_tickets
for update
to authenticated
using (app_private.current_user_role() in ('super_admin', 'superadmin'))
with check (app_private.current_user_role() in ('super_admin', 'superadmin'));

revoke all on function public.get_my_company_id() from public, anon, authenticated;
revoke all on function public.get_my_role() from public, anon, authenticated;
revoke all on function public.get_user_company_id() from public, anon, authenticated;
revoke all on function public.get_user_role() from public, anon, authenticated;
revoke all on function public.current_user_company_id() from public, anon, authenticated;
revoke all on function public.current_user_role() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

alter function public.get_my_company_id() set search_path = public, pg_temp;
alter function public.get_my_role() set search_path = public, pg_temp;
alter function public.get_user_company_id() set search_path = public, pg_temp;
alter function public.get_user_role() set search_path = public, pg_temp;
alter function public.current_user_company_id() set search_path = public, pg_temp;
alter function public.current_user_role() set search_path = public, pg_temp;
alter function public.rls_auto_enable() set search_path = pg_catalog;

revoke all on public.visitors from anon;
