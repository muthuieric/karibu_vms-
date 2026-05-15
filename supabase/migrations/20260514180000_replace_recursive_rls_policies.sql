create or replace function public.current_user_company_id()
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

create or replace function public.current_user_role()
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

alter function public.current_user_company_id() owner to postgres;
alter function public.current_user_role() owner to postgres;

grant execute on function public.current_user_company_id() to authenticated, service_role;
grant execute on function public.current_user_role() to authenticated, service_role;

create or replace function public.get_my_company_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select public.current_user_company_id();
$$;

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select public.current_user_role();
$$;

create or replace function public.get_user_company_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select public.current_user_company_id();
$$;

create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select public.current_user_role()::public.user_role;
$$;

alter function public.get_my_company_id() owner to postgres;
alter function public.get_my_role() owner to postgres;
alter function public.get_user_company_id() owner to postgres;
alter function public.get_user_role() owner to postgres;

grant execute on function public.get_my_company_id() to anon, authenticated, service_role;
grant execute on function public.get_my_role() to anon, authenticated, service_role;
grant execute on function public.get_user_company_id() to anon, authenticated, service_role;
grant execute on function public.get_user_role() to anon, authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.visitors enable row level security;
alter table public.gates enable row level security;
alter table public.hosts enable row level security;
alter table public.departments enable row level security;
alter table public.red_flags enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "Profiles View Policy" on public.profiles;
drop policy if exists "Profiles Update Policy" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Company admins can read company profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Company admins can update company profiles" on public.profiles;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Company admins can read company profiles"
on public.profiles
for select
to authenticated
using (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Company admins can update company profiles"
on public.profiles
for update
to authenticated
using (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
)
with check (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

drop policy if exists "Company Admins can update their company" on public.companies;
drop policy if exists "Public can view companies" on public.companies;
drop policy if exists "Super Admins can insert companies" on public.companies;
drop policy if exists "Super Admins can update companies" on public.companies;
drop policy if exists "Super Admins can view all companies" on public.companies;
drop policy if exists "Users can view their own company" on public.companies;
drop policy if exists "Companies public read" on public.companies;
drop policy if exists "Users can view their company" on public.companies;
drop policy if exists "Company admins can update their company" on public.companies;
drop policy if exists "Super admins can manage companies" on public.companies;

create policy "Companies public read"
on public.companies
for select
using (true);

create policy "Company admins can update their company"
on public.companies
for update
to authenticated
using (
  id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
)
with check (
  id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Super admins can manage companies"
on public.companies
for all
to authenticated
using (public.current_user_role() in ('super_admin', 'superadmin'))
with check (public.current_user_role() in ('super_admin', 'superadmin'));

drop policy if exists "Anyone can insert a visitor via QR code form" on public.visitors;
drop policy if exists "Tenants can manage their own visitors" on public.visitors;
drop policy if exists "Visitors Access Policy" on public.visitors;
drop policy if exists "Super Admins can view all visitors" on public.visitors;
drop policy if exists "Visitors authenticated company select" on public.visitors;
drop policy if exists "Visitors authenticated company insert" on public.visitors;
drop policy if exists "Visitors authenticated company update" on public.visitors;
drop policy if exists "Visitors super admins manage all" on public.visitors;
drop policy if exists "Users can view visitors for their company" on public.visitors;
drop policy if exists "Guards can add visitors for their company" on public.visitors;
drop policy if exists "Users can update visitors for their company" on public.visitors;
drop policy if exists "Super admins can manage visitors" on public.visitors;

create policy "Users can view visitors for their company"
on public.visitors
for select
to authenticated
using (
  company_id = public.current_user_company_id()
  or public.current_user_role() in ('super_admin', 'superadmin')
);

create policy "Guards can add visitors for their company"
on public.visitors
for insert
to authenticated
with check (
  company_id = public.current_user_company_id()
  and status = 'pending'::public.visit_status
  and public.current_user_role() in ('guard', 'company_admin', 'super_admin', 'superadmin')
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
  company_id = public.current_user_company_id()
  or public.current_user_role() in ('super_admin', 'superadmin')
)
with check (
  company_id = public.current_user_company_id()
  or public.current_user_role() in ('super_admin', 'superadmin')
);

create policy "Super admins can manage visitors"
on public.visitors
for all
to authenticated
using (public.current_user_role() in ('super_admin', 'superadmin'))
with check (public.current_user_role() in ('super_admin', 'superadmin'));

drop policy if exists "Gates company read" on public.gates;
drop policy if exists "Gates company insert" on public.gates;
drop policy if exists "Gates company update" on public.gates;
drop policy if exists "Gates company delete" on public.gates;

create policy "Gates company read"
on public.gates
for select
to authenticated
using (
  company_id = public.current_user_company_id()
  or public.current_user_role() in ('super_admin', 'superadmin')
);

create policy "Gates company insert"
on public.gates
for insert
to authenticated
with check (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Gates company update"
on public.gates
for update
to authenticated
using (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
)
with check (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Gates company delete"
on public.gates
for delete
to authenticated
using (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
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
  company_id = public.current_user_company_id()
  or public.current_user_role() in ('super_admin', 'superadmin')
);

create policy "Hosts company insert"
on public.hosts
for insert
to authenticated
with check (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Hosts company update"
on public.hosts
for update
to authenticated
using (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
)
with check (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Hosts company delete"
on public.hosts
for delete
to authenticated
using (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
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
  company_id = public.current_user_company_id()
  or public.current_user_role() in ('super_admin', 'superadmin')
);

create policy "Departments company insert"
on public.departments
for insert
to authenticated
with check (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Departments company update"
on public.departments
for update
to authenticated
using (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
)
with check (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Departments company delete"
on public.departments
for delete
to authenticated
using (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
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
  company_id = public.current_user_company_id()
  or public.current_user_role() in ('super_admin', 'superadmin')
);

create policy "Red flags company insert"
on public.red_flags
for insert
to authenticated
with check (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Red flags company update"
on public.red_flags
for update
to authenticated
using (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
)
with check (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

create policy "Red flags company delete"
on public.red_flags
for delete
to authenticated
using (
  company_id = public.current_user_company_id()
  and public.current_user_role() in ('company_admin', 'super_admin', 'superadmin')
);

drop policy if exists "Company admins can view their own transactions" on public.transactions;
drop policy if exists "Superadmins can view all transactions" on public.transactions;
drop policy if exists "Transactions company read" on public.transactions;
drop policy if exists "Super admins can view transactions" on public.transactions;

create policy "Transactions company read"
on public.transactions
for select
to authenticated
using (
  company_id = public.current_user_company_id()
  or public.current_user_role() in ('super_admin', 'superadmin')
);

revoke all on public.visitors from anon;
grant select, insert, update on public.visitors to authenticated;
grant select on public.gates to authenticated;
grant select on public.hosts to authenticated;
grant select on public.departments to authenticated;
grant select on public.red_flags to authenticated;
