alter table public.visitors
  add column if not exists hash_key_id text;

alter table public.red_flags
  add column if not exists hash_key_id text;

create index if not exists idx_visitors_hash_key_id
  on public.visitors(hash_key_id)
  where hash_key_id is not null;

create index if not exists idx_red_flags_hash_key_id
  on public.red_flags(hash_key_id)
  where hash_key_id is not null;
