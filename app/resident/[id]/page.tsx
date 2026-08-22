import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ResidentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("id,first_name,last_initial,profile_photo_url,community,profession,business_name,member_since,verification_status").eq("id", id).maybeSingle();
  if (!profile || profile.verification_status !== "verified") notFound();
  const community = profile.community === "jordan_ranch" ? "Jordan Ranch" : "Tamarron";
  return <main className="auth-page"><section className="auth-card">
    <Link href="/" className="auth-brand">Jordan Ranch & Tamarron</Link>
    <section className="profile-card">
      {profile.profile_photo_url ? <img className="avatar-photo" src={profile.profile_photo_url} alt="Resident profile" /> : <div className="avatar">{profile.first_name[0]}{profile.last_initial}</div>}
      <div className="profile-name">{profile.first_name} {profile.last_initial}.</div>
      <div className="profile-detail">✓ Verified {community} Resident</div>
      {profile.profession && <div className="profile-detail">Profession: {profile.profession}</div>}
      {profile.business_name && <div className="profile-detail">Business: {profile.business_name}</div>}
      <div className="profile-detail">Member since {new Date(profile.member_since).toLocaleDateString(undefined,{month:"long",year:"numeric"})}</div>
    </section>
    <div className="private-note">Resident profiles never display street addresses, email addresses, phone numbers, saved content, bios or business websites.</div>
  </section></main>;
}
