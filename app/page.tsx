import Link from "next/link";
import { redirect } from "next/navigation";
import ResidentApp from "@/components/resident-app";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.user_metadata?.account_type === "advertiser") redirect("/advertise/dashboard");

  const [{ data: profile }, { data: verification }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,first_name,last_initial,profile_photo_url,community,profession,business_name,member_since,verification_status")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("resident_verifications")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const isVerified = profile?.verification_status === "verified" || verification?.status === "verified";

  // Do not bounce an authenticated but unverified resident away from the root.
  // Keep the browser on jrt.community and let the resident deliberately enter
  // the verification flow. This prevents redirect flicker and stale-session loops.
  if (!profile || !isVerified) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-brand">Jordan Ranch & Tamarron Residents</div>
          <span className="badge">Residents Only</span>
          <h1>Finish setting up your resident account</h1>
          <p className="auth-copy">
            Your account is signed in, but residency verification is not complete for this session.
            You can stay on JRT.community and continue when you are ready.
          </p>
          <div className="form-stack">
            <Link href="/verify-residency" className="btn-primary">Verify Residency</Link>
            <Link href="/login?switch=1" className="btn-secondary">Use a Different Account</Link>
          </div>
        </section>
      </main>
    );
  }

  const [totalResult,jordanResult,tamarronResult,listingsResult,businessesResult,homeAdsResult,localAdsResult,dealsResult,updatesResult,residentPostsResult,eventsResult] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "verified"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "verified").eq("community", "jordan_ranch"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "verified").eq("community", "tamarron"),
    supabase.from("marketplace_listings").select("id,title,price,community,view_count,image_urls,category,created_at").eq("status", "active").order("created_at", { ascending: false }).limit(30),
    supabase.from("businesses").select("id,name,category,description,average_rating,rating_count,profile_view_count,logo_url,image_urls,promotion_rank").order("promotion_rank",{ascending:false}).order("name").limit(50),
    supabase.from("business_ads").select("id,headline,body,format,media_urls,impression_count,video_play_count,click_count,businesses(id,name)").eq("approval_status", "approved").eq("is_active", true).eq("placement_home", true).order("created_at", { ascending: false }).limit(12),
    supabase.from("business_ads").select("id,headline,body,format,media_urls,impression_count,video_play_count,click_count,businesses(id,name)").eq("approval_status", "approved").eq("is_active", true).eq("placement_local", true).order("created_at", { ascending: false }).limit(12),
    supabase.from("deals").select("id,title,description,code,view_count,claim_count,expires_at,businesses(id,name)").eq("approval_status", "approved").eq("is_active", true).order("created_at", { ascending: false }).limit(30),
    supabase.from("community_updates").select("id,title,body,category,published_at").order("published_at", { ascending: false }).limit(10),
    supabase.from("resident_posts").select("id,title,body,category,location_text,created_at,profiles!resident_posts_author_id_fkey(first_name,last_initial)").eq("status","active").order("created_at",{ascending:false}).limit(20),
    supabase.from("community_events").select("id,title,description,location,starts_at,ends_at").gte("starts_at", new Date().toISOString()).order("starts_at", { ascending: true }).limit(8),
  ]);

  type ResidentPostRow={id:string;title:string;body:string;category:string;location_text:string|null;created_at:string;profiles:Array<{first_name:string;last_initial:string}>|null};
  const residentPosts = ((residentPostsResult.data ?? []) as unknown as ResidentPostRow[]).map((post)=>{
    const author=Array.isArray(post.profiles)?post.profiles[0]:null;
    return {
      id:`resident-${post.id}`,
      title:post.title,
      body:`${post.body}${post.location_text?` · ${post.location_text}`:""}${author?` · Shared by ${author.first_name} ${author.last_initial}.`:""}`,
      category:`resident ${post.category}`,
      published_at:post.created_at,
    };
  });

  const combinedUpdates = [...((updatesResult.data ?? []) as Array<{id:string;title:string;body:string|null;category:string;published_at:string}>), ...residentPosts]
    .sort((a,b)=>new Date(b.published_at).getTime()-new Date(a.published_at).getTime())
    .slice(0,20);

  return <>
    <ResidentApp profile={{id:profile.id,first_name:profile.first_name,last_initial:profile.last_initial,profile_photo_url:profile.profile_photo_url,community:profile.community,profession:profile.profession,business_name:profile.business_name,member_since:profile.member_since}} residentCount={{total:totalResult.count??0,jordan:jordanResult.count??0,tamarron:tamarronResult.count??0}} listings={(listingsResult.data??[]) as never[]} businesses={(businessesResult.data??[]) as never[]} homeAds={(homeAdsResult.data??[]) as never[]} localAds={(localAdsResult.data??[]) as never[]} deals={(dealsResult.data??[]) as never[]} updates={combinedUpdates as never[]} events={(eventsResult.data??[]) as never[]}/>
    <Link href="/community/new" className="share-update-fab">+ Share Update</Link>
  </>;
}
