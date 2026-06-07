alter table if exists public.incident_reports
  add column if not exists red_flag_id uuid references public.red_flags(id) on delete set null;

create index if not exists incident_reports_red_flag_id_idx
  on public.incident_reports(red_flag_id)
  where red_flag_id is not null;
