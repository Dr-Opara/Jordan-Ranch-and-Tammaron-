import { redirect } from "next/navigation";
import ResidentApp from "@/components/resident-app";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.user_metadata?.account_type === "advertiser") redirect("/advertise/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,first_name,last_initial,profile_photo_url,community,profession,business_name,member_since,verification_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.verification_status !== "verified") redirect("/verify-residency");

  const [totalResult, jordanResult, tamarronResult, listingsResult, businessesResult, adsResult, dealsResult] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "verified"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "verified").eq("community", "jordan_ranch"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "verified").eq("community", "tamarron"),
    supabase.from("marketplace_listings").select("id,title,price,community,view_count,image_urls,category,created_at").eq("status", "active").order("created_at", { ascending: false }).limit(30),
    supabase.from("businesses").select("id,name,category,description,average_rating,rating_count,profile_view_count,logo_url,image_urls").order("name").limit(50),
    supabase.from("business_ads").select("id,headline,body,format,media_urls,impression_count,video_play_count,click_count,businesses(name)").eq("approval_status", "approved").eq("is_active", true).order("created_at", { ascending: false }).limit(12),
    supabase.from("deals").select("id,title,description,code,view_count,claim_count,expires_at,businesses(name)").eq("approval_status", "approved").eq("is_active", true).order("created_at", { ascending: false }).limit(30),
  ]);

  return (
    <ResidentApp
      profile={{
        id: profile.id,
        first_name: profile.first_name,
        last_initial: profile.last_initial,
        profile_photo_url: profile.profile_photo_url,
        community: profile.community,
        profession: profile.profession,
        business_name: profile.business_name,
        member_since: profile.member_since,
      }}
      residentCount={{ total: totalResult.count ?? 0, jordan: jordanResult.count ?? 0, tamarron: tamarronResult.count ?? 0 }}
      listings={(listingsResult.data ?? []) as never[]}
      businesses={(businessesResult.data ?? []) as never[]}
      ads={(adsResult.data ?? []) as never[]}
      deals={(dealsResult.data ?? []) as never[]}
    />
  );
}
