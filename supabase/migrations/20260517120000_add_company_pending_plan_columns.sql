alter table public.companies
  add column if not exists plan_tier text default 'basic',
  add column if not exists pending_plan_tier text,
  add column if not exists pending_plan_effective_at timestamptz,
  add column if not exists billing_period_start timestamptz,
  add column if not exists billing_period_end timestamptz;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'companies'
      and column_name = 'plan_change_effective_at'
  ) then
    execute '
      update public.companies
      set pending_plan_effective_at = plan_change_effective_at
      where pending_plan_effective_at is null
    ';
  end if;
end $$;
