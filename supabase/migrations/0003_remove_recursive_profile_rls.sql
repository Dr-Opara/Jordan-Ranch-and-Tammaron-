-- Remove the recursive profile SELECT policy. Referencing public.profiles from a
-- SELECT policy on public.profiles can recurse and makes client-side resident
-- access checks unreliable.
drop policy if exists "residents and admins can view allowed profiles" on public.profiles;

drop policy if exists "verified residents can view verified profiles" on public.profiles;
create policy "verified residents can view verified profiles"
on public.profiles for select
to authenticated
using (
  id = (select auth.uid())
  or (
    verification_status = 'verified'
    and exists (
      select 1
      from public.resident_verifications rv
      where rv.user_id = (select auth.uid())
        and rv.status = 'verified'
    )
  )
);
