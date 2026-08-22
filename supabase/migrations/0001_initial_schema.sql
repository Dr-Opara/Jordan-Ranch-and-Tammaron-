create extension if not exists pgcrypto;

create type public.community_name as enum ('jordan_ranch', 'tamarron');
create type public.verification_status as enum ('pending', 'verified', 'rejected');
create type public.listing_status as enum ('active', 'sold', 'archived');
create type public.ad_format as enum ('image', 'video', 'carousel', 'deal', 'coming_soon');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_initial text not null check (char_length(last_initial) = 1),
  profile_photo_url text,
  community public.community_name not null,
  profession text,
  business_name text,
  verification_status public.verification_status not null default 'pending',
  member_since timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resident_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  community public.community_name not null,
  residential_address text not null,
  evidence_path text,
  status public.verification_status not null default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  price numeric(10,2) check (price >= 0),
  category text not null,
  community public.community_name not null,
  visible_to_both boolean not null default false,
  image_urls text[] not null default '{}',
  status public.listing_status not null default 'active',
  view_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  category text not null,
  description text,
  address text,
  phone text,
  hours jsonb,
  logo_url text,
  image_urls text[] not null default '{}',
  is_claimed boolean not null default false,
  is_verified boolean not null default false,
  average_rating numeric(2,1) not null default 0,
  rating_count integer not null default 0,
  profile_view_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_ads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  format public.ad_format not null,
  headline text not null,
  body text,
  media_urls text[] not null default '{}',
  cta_label text,
  cta_url text,
  target_jordan_ranch boolean not null default true,
  target_tamarron boolean not null default true,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default false,
  impression_count bigint not null default 0,
  video_play_count bigint not null default 0,
  click_count bigint not null default 0,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  code text,
  target_jordan_ranch boolean not null default true,
  target_tamarron boolean not null default true,
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  view_count bigint not null default 0,
  claim_count bigint not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (expires_at > starts_at)
);

create table public.saved_marketplace (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table public.saved_businesses (
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, business_id)
);

create table public.saved_deals (
  user_id uuid not null references auth.users(id) on delete cascade,
  deal_id uuid not null references public.deals(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, deal_id)
);

alter table public.profiles enable row level security;
alter table public.resident_verifications enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.businesses enable row level security;
alter table public.business_ads enable row level security;
alter table public.deals enable row level security;
alter table public.saved_marketplace enable row level security;
alter table public.saved_businesses enable row level security;
alter table public.saved_deals enable row level security;

create policy "verified residents can view verified profiles"
on public.profiles for select
to authenticated
using (
  verification_status = 'verified'
  and exists (
    select 1 from public.profiles viewer
    where viewer.id = (select auth.uid())
      and viewer.verification_status = 'verified'
  )
);

create policy "users manage their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "users can insert their own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "users access own verification"
on public.resident_verifications for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users submit own verification"
on public.resident_verifications for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "users update own pending verification"
on public.resident_verifications for update
to authenticated
using ((select auth.uid()) = user_id and status = 'pending')
with check ((select auth.uid()) = user_id and status = 'pending');

create policy "verified residents view marketplace"
on public.marketplace_listings for select
to authenticated
using (
  status = 'active'
  and exists (
    select 1 from public.profiles viewer
    where viewer.id = (select auth.uid())
      and viewer.verification_status = 'verified'
      and (visible_to_both or viewer.community = marketplace_listings.community)
  )
);

create policy "verified residents create listings"
on public.marketplace_listings for insert
to authenticated
with check (
  (select auth.uid()) = seller_id
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.verification_status = 'verified'
  )
);

create policy "sellers manage own listings"
on public.marketplace_listings for update
to authenticated
using ((select auth.uid()) = seller_id)
with check ((select auth.uid()) = seller_id);

create policy "verified residents view businesses"
on public.businesses for select
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid()) and p.verification_status = 'verified'
));

create policy "business owners update claimed businesses"
on public.businesses for update
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy "verified residents view active ads"
on public.business_ads for select
to authenticated
using (
  is_active
  and now() between starts_at and ends_at
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.verification_status = 'verified'
      and ((p.community = 'jordan_ranch' and target_jordan_ranch) or (p.community = 'tamarron' and target_tamarron))
  )
);

create policy "business owners manage ads"
on public.business_ads for all
to authenticated
using (exists (
  select 1 from public.businesses b
  where b.id = business_ads.business_id and b.owner_user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.businesses b
  where b.id = business_ads.business_id and b.owner_user_id = (select auth.uid())
));

create policy "verified residents view active deals"
on public.deals for select
to authenticated
using (
  is_active
  and now() between starts_at and expires_at
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.verification_status = 'verified'
      and ((p.community = 'jordan_ranch' and target_jordan_ranch) or (p.community = 'tamarron' and target_tamarron))
  )
);

create policy "owners manage own marketplace saves"
on public.saved_marketplace for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "owners manage own business saves"
on public.saved_businesses for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "owners manage own deal saves"
on public.saved_deals for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index marketplace_community_status_idx on public.marketplace_listings (community, status, created_at desc);
create index business_category_idx on public.businesses (category);
create index active_ads_window_idx on public.business_ads (is_active, starts_at, ends_at);
create index active_deals_window_idx on public.deals (is_active, starts_at, expires_at);
