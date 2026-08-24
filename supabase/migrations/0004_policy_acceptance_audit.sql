create table if not exists public.policy_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_type text not null check (account_type in ('resident','advertiser')),
  bundle_version text not null,
  accepted_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,
  acceptance_source text not null default 'required_gate',
  unique(user_id,bundle_version)
);

alter table public.policy_acceptances enable row level security;

create policy "users view own policy acceptances"
on public.policy_acceptances for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users record own policy acceptances"
on public.policy_acceptances for insert
to authenticated
with check ((select auth.uid()) = user_id);

create index if not exists policy_acceptances_user_version_idx
on public.policy_acceptances(user_id,bundle_version);
