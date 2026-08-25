"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Community = "jordan_ranch" | "tamarron";

const categories = [
  ["community_update", "Community Update"],
  ["lost_found", "Lost & Found"],
  ["traffic_safety", "Traffic / Safety"],
  ["recommendation", "Recommendation"],
  ["neighborhood", "Neighborhood"],
  ["other", "Other"],
] as const;

export default function NewCommunityPostPage() {
  const [community, setCommunity] = useState<Community>("jordan_ranch");
  const [category, setCategory] = useState("community_update");
  const [body, setBody] = useState("");
  const [location, setLocation] = useState("");
  const [both, setBoth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const s = createClient();
      const { data: auth } = await s.auth.getUser();
      if (!auth.user) { window.location.replace("/login"); return; }

      const [{ data: profile }, { data: verification }] = await Promise.all([
        s.from("profiles").select("community,verification_status").eq("id", auth.user.id).maybeSingle(),
        s.from("resident_verifications").select("community,status").eq("user_id", auth.user.id).maybeSingle(),
      ]);

      const verified = profile?.verification_status === "verified" || verification?.status === "verified";
      if (!verified) { window.location.replace("/"); return; }

      setCommunity((profile?.community ?? verification?.community ?? "jordan_ranch") as Community);
      setCheckingAccess(false);
    })();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const s = createClient();
    const { data: auth } = await s.auth.getUser();
    if (!auth.user) { window.location.replace("/login"); return; }

    const cleanBody = body.trim();
    const generatedTitle = cleanBody.length > 120 ? `${cleanBody.slice(0, 117)}...` : cleanBody;

    const { error: insertError } = await s.from("resident_posts").insert({
      author_id: auth.user.id,
      community,
      visible_to_both: both,
      category,
      title: generatedTitle,
      body: cleanBody,
      location_text: location.trim() || null,
      status: "active",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    window.location.replace("/");
  }

  if (checkingAccess) return <main className="auth-page"><section className="auth-card">Checking resident access…</section></main>;

  return <main className="auth-page"><section className="auth-card wide">
    <Link href="/" className="auth-brand">Jordan Ranch & Tamarron Residents</Link>
    <span className="badge">Resident Community</span>
    <h1>Share what’s happening</h1>
    <p className="auth-copy">Post a neighborhood update for verified residents. There are no likes or comments; residents can view updates and report anything inappropriate.</p>
    <form className="form-stack" onSubmit={submit}>
      <label>Type of update<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
      <label><span style={{fontSize:13,fontWeight:500,color:"#8a94a3"}}>What’s happening around you</span><textarea required minLength={1} maxLength={2000} value={body} onChange={e=>setBody(e.target.value)} placeholder="Share the useful details residents should know."/></label>
      <label>General location <span className="optional">optional — never use your private verification address</span><input maxLength={160} value={location} onChange={e=>setLocation(e.target.value)} placeholder="Example: near The Shed / Texas Heritage Parkway"/></label>
      <label><span><input type="checkbox" checked={both} onChange={e=>setBoth(e.target.checked)}/> Share with both Jordan Ranch and Tamarron</span></label>
      <div className="private-note">Your post shows your public resident identity only: first name + last initial. Your full legal name and residential verification address remain private.</div>
      {error&&<div className="form-error">{error}</div>}
      <button className="btn-primary" disabled={loading}>{loading?"Posting…":"Share Community Update"}</button>
      <Link href="/" className="btn-secondary" style={{textAlign:"center",textDecoration:"none"}}>Cancel</Link>
    </form>
  </section></main>;
}
