alter table public.companies
add column if not exists hard_locked boolean default false,
add column if not exists hard_lock_reason text,
add column if not exists hard_locked_at timestamp with time zone;
