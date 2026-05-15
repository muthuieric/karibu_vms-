alter table public.visitors
  add column if not exists host_name text,
  add column if not exists purpose text,
  add column if not exists vehicle_reg text,
  add column if not exists checked_in_at timestamptz,
  add column if not exists custom_data jsonb default '{}'::jsonb,
  add column if not exists host_id uuid references public.hosts(id) on delete set null,
  add column if not exists gate_id uuid references public.gates(id) on delete set null,
  add column if not exists host_confirmed boolean default false,
  add column if not exists photo_url text,
  add column if not exists document_type text default 'National ID';

alter table public.visitors enable row level security;

drop policy if exists "Anyone can insert a visitor via QR code form" on public.visitors;
drop policy if exists "Tenants can manage their own visitors" on public.visitors;
drop policy if exists "Visitors Access Policy" on public.visitors;
drop policy if exists "Super Admins can view all visitors" on public.visitors;
drop policy if exists "Visitors authenticated company select" on public.visitors;
drop policy if exists "Visitors authenticated company insert" on public.visitors;
drop policy if exists "Visitors authenticated company update" on public.visitors;
drop policy if exists "Visitors super admins manage all" on public.visitors;

create policy "Visitors authenticated company select"
on public.visitors
for select
to authenticated
using (
  company_id = public.get_user_company_id()
  or public.get_user_role() in ('super_admin'::public.user_role, 'superadmin'::public.user_role)
);

create policy "Visitors authenticated company insert"
on public.visitors
for insert
to authenticated
with check (
  status = 'pending'::public.visit_status
  and (
    company_id = public.get_user_company_id()
    or public.get_user_role() in ('super_admin'::public.user_role, 'superadmin'::public.user_role)
  )
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

create policy "Visitors authenticated company update"
on public.visitors
for update
to authenticated
using (
  company_id = public.get_user_company_id()
  or public.get_user_role() in ('super_admin'::public.user_role, 'superadmin'::public.user_role)
)
with check (
  company_id = public.get_user_company_id()
  or public.get_user_role() in ('super_admin'::public.user_role, 'superadmin'::public.user_role)
);

create policy "Visitors super admins manage all"
on public.visitors
for all
to authenticated
using (public.get_user_role() in ('super_admin'::public.user_role, 'superadmin'::public.user_role))
with check (public.get_user_role() in ('super_admin'::public.user_role, 'superadmin'::public.user_role));

revoke all on public.visitors from anon;
grant select, insert, update on public.visitors to authenticated;

comment on policy "Visitors authenticated company insert" on public.visitors is
  'Guard/admin inserts must stay inside the authenticated user company. Public QR inserts go through /api/visitors/register, which validates company, gate, and host server-side with the service role key.';
