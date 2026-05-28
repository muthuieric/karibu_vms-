drop index if exists public.idx_visitors_active_pass_code;

create unique index if not exists visitors_company_active_pass_code_key
  on public.visitors(company_id, pass_code)
  where pass_code is not null
    and checked_out_at is null
    and pass_expired_at is null;

create index if not exists idx_visitors_company_status_pass_token
  on public.visitors(company_id, status, pass_token)
  where pass_token is not null;
