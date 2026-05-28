-- Standardise transaction billing period keys to YYYY-MM.
-- Example: 2026-05-28, 2026-05-19, and 2026-05-01 become 2026-05.

update public.transactions
set billing_period_key = substring(billing_period_key from 1 for 7)
where billing_period_key ~ '^\d{4}-\d{2}(-\d{2})?$';

create index if not exists idx_transactions_company_billing_period_key
  on public.transactions(company_id, billing_period_key);

select pg_notify('pgrst', 'reload schema');
