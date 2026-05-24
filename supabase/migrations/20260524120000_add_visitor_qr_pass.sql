alter table public.visitors
  add column if not exists pass_token text,
  add column if not exists pass_code text,
  add column if not exists pass_expired_at timestamp with time zone,
  add column if not exists host_confirmed_at timestamp with time zone,
  add column if not exists verification_method text;

alter table public.visitors
  drop constraint if exists visitors_pass_code_check;

alter table public.visitors
  add constraint visitors_pass_code_check
  check (pass_code is null or pass_code ~ '^[0-9]{6}$');

create unique index if not exists visitors_pass_token_key
  on public.visitors(pass_token)
  where pass_token is not null;

create index if not exists idx_visitors_company_status_pass_token
  on public.visitors(company_id, status, pass_token)
  where pass_token is not null;

create index if not exists idx_visitors_active_pass_code
  on public.visitors(company_id, pass_code)
  where pass_code is not null and pass_expired_at is null;
