create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_type text not null default 'resident' check (account_type in ('resident','business')),
  category text not null check (category in ('general','account','verification','marketplace','business','billing','privacy','safety','account_deletion')),
  subject text not null check (char_length(subject) between 3 and 160),
  message text not null check (char_length(message) between 10 and 5000),
  status text not null default 'open' check (status in ('open','in_progress','resolved')),
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists support_messages_user_id_idx on public.support_messages(user_id, created_at desc);
create index if not exists support_messages_status_idx on public.support_messages(status, created_at desc);
alter table public.support_messages enable row level security;
create policy "users read own support messages" on public.support_messages for select to authenticated using (auth.uid() = user_id);
create policy "users create own support messages" on public.support_messages for insert to authenticated with check (auth.uid() = user_id);
create policy "admins manage support messages" on public.support_messages for all to authenticated using (exists (select 1 from public.app_admins a where a.user_id = auth.uid())) with check (exists (select 1 from public.app_admins a where a.user_id = auth.uid()));