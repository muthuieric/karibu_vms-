alter table public.companies
  add column if not exists visitor_verification_method text default 'qr_pass';

alter table public.companies
  drop constraint if exists companies_visitor_verification_method_check;

alter table public.companies
  add constraint companies_visitor_verification_method_check
  check (visitor_verification_method in ('qr_pass', 'sms_otp'));
