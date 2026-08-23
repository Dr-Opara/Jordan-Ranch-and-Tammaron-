-- Backend hardening applied to production.
-- Keep trigger helper callable only by the database trigger itself.
revoke execute on function public.protect_profile_verification_status() from public, anon, authenticated;
