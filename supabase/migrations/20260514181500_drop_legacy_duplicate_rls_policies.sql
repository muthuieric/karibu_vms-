drop policy if exists "companies_insert_superadmin_only" on public.companies;
drop policy if exists "companies_select_own_or_superadmin" on public.companies;
drop policy if exists "companies_update_own_admin_or_superadmin" on public.companies;

drop policy if exists "Allow company admins to manage departments" on public.departments;
drop policy if exists "Allow users in same company to read departments" on public.departments;

drop policy if exists "Allow company admins to manage gates" on public.gates;
drop policy if exists "Allow users in same company to read gates" on public.gates;

drop policy if exists "Allow company admins to manage hosts" on public.hosts;
drop policy if exists "Allow users in same company to read hosts" on public.hosts;

drop policy if exists "profiles_select_self_company_or_superadmin" on public.profiles;
drop policy if exists "profiles_update_self_company_admin_or_superadmin" on public.profiles;

drop policy if exists "Allow guards and admins to manage red_flags" on public.red_flags;
drop policy if exists "Allow users in same company to read red_flags" on public.red_flags;

drop policy if exists "visitors_anon_insert_for_unlocked_company" on public.visitors;
drop policy if exists "visitors_delete_superadmin_only" on public.visitors;
drop policy if exists "visitors_insert_own_company_or_superadmin" on public.visitors;
drop policy if exists "visitors_select_own_company_or_superadmin" on public.visitors;
drop policy if exists "visitors_update_own_company_or_superadmin" on public.visitors;

revoke all on public.visitors from anon;
