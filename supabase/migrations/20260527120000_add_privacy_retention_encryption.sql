alter table public.visitors
  add column if not exists phone_encrypted text,
  add column if not exists phone_hash text,
  add column if not exists phone_last4 text,
  add column if not exists id_number_encrypted text,
  add column if not exists id_number_hash text,
  add column if not exists id_number_last4 text,
  add column if not exists vehicle_reg_encrypted text,
  add column if not exists vehicle_reg_hash text,
  add column if not exists vehicle_reg_last4 text,
  add column if not exists retention_days integer default 180,
  add column if not exists delete_after timestamptz,
  add column if not exists retention_hold_until timestamptz,
  add column if not exists personal_data_anonymized_at timestamptz;

alter table public.visitors
  alter column phone drop not null;

alter table public.companies
  add column if not exists require_phone boolean default false,
  add column if not exists require_id boolean default false,
  add column if not exists require_vehicle boolean default false,
  add column if not exists require_host boolean default false,
  add column if not exists require_purpose boolean default false;

alter table public.red_flags
  add column if not exists name_encrypted text,
  add column if not exists phone_encrypted text,
  add column if not exists phone_hash text,
  add column if not exists phone_last4 text,
  add column if not exists id_number_encrypted text,
  add column if not exists id_number_hash text,
  add column if not exists id_number_last4 text,
  add column if not exists vehicle_reg_encrypted text,
  add column if not exists vehicle_reg_hash text,
  add column if not exists vehicle_reg_last4 text,
  add column if not exists reason_category text,
  add column if not exists action text default 'deny_entry',
  add column if not exists status text default 'active',
  add column if not exists review_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists updated_at timestamptz default now();

alter table public.red_flags
  alter column phone drop not null,
  alter column id_number drop not null;

create table if not exists public.billing_usage (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  billing_month date not null,
  visitor_count integer not null default 0,
  included_visitors integer not null default 500,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, billing_month)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  actor_role text,
  action text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_visitors_delete_after
  on public.visitors(delete_after)
  where personal_data_anonymized_at is null;

create index if not exists idx_visitors_photo_cleanup
  on public.visitors(created_at)
  where photo_url is not null;

create index if not exists idx_red_flags_company_status_phone_hash
  on public.red_flags(company_id, status, phone_hash)
  where phone_hash is not null;

create index if not exists idx_red_flags_company_status_id_hash
  on public.red_flags(company_id, status, id_number_hash)
  where id_number_hash is not null;

create index if not exists idx_red_flags_company_status_vehicle_hash
  on public.red_flags(company_id, status, vehicle_reg_hash)
  where vehicle_reg_hash is not null;

create index if not exists idx_red_flags_expires_at
  on public.red_flags(expires_at)
  where status = 'active';

create index if not exists idx_billing_usage_company_month
  on public.billing_usage(company_id, billing_month);

create index if not exists idx_audit_logs_company_created
  on public.audit_logs(company_id, created_at desc);

create index if not exists idx_audit_logs_action_created
  on public.audit_logs(action, created_at desc);

alter table public.billing_usage enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Guards can add visitors for their company" on public.visitors;
create policy "Users can insert privacy-safe visitors for their company"
on public.visitors
for insert
with check (
  (
    company_id = public.get_my_company_id()
    or public.get_my_role() in ('super_admin', 'superadmin')
  )
  and coalesce(phone, '') = ''
  and id_number is null
  and vehicle_reg is null
);

drop policy if exists "Billing usage company read" on public.billing_usage;
create policy "Billing usage company read"
on public.billing_usage
for select
using (
  company_id = public.get_my_company_id()
  or public.get_my_role() = 'super_admin'
  or public.get_my_role() = 'superadmin'
);

drop policy if exists "Audit logs admin read" on public.audit_logs;
create policy "Audit logs admin read"
on public.audit_logs
for select
using (
  public.get_my_role() in ('company_admin', 'super_admin', 'superadmin')
  and (
    company_id = public.get_my_company_id()
    or public.get_my_role() in ('super_admin', 'superadmin')
  )
);

drop policy if exists "Red flags company insert" on public.red_flags;
drop policy if exists "Red flags company update" on public.red_flags;
drop policy if exists "Red flags company delete" on public.red_flags;

create policy "Red flags admin insert"
on public.red_flags
for insert
with check (
  public.get_my_role() in ('company_admin', 'super_admin', 'superadmin')
  and (
    company_id = public.get_my_company_id()
    or public.get_my_role() in ('super_admin', 'superadmin')
  )
);

create policy "Red flags admin update"
on public.red_flags
for update
using (
  public.get_my_role() in ('company_admin', 'super_admin', 'superadmin')
  and (
    company_id = public.get_my_company_id()
    or public.get_my_role() in ('super_admin', 'superadmin')
  )
)
with check (
  public.get_my_role() in ('company_admin', 'super_admin', 'superadmin')
  and (
    company_id = public.get_my_company_id()
    or public.get_my_role() in ('super_admin', 'superadmin')
  )
);

create policy "Red flags admin delete"
on public.red_flags
for delete
using (
  public.get_my_role() in ('company_admin', 'super_admin', 'superadmin')
  and (
    company_id = public.get_my_company_id()
    or public.get_my_role() in ('super_admin', 'superadmin')
  )
);

grant select on public.billing_usage to authenticated;
grant select on public.audit_logs to authenticated;
grant all on public.billing_usage to service_role;
grant all on public.audit_logs to service_role;
