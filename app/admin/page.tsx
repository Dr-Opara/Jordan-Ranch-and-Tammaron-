"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldCheck, Store, CalendarDays, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminHome(){
  const [authorized,setAuthorized]=useState<boolean|null>(null);
  useEffect(()=>{(async()=>{const s=createClient();const {data:u}=await s.auth.getUser();if(!u.user){window.location.href="/login";return;}const {data:a}=await s.from("app_admins").select("user_id").eq("user_id",u.user.id).maybeSingle();setAuthorized(!!a);})();},[]);
  if(authorized===null)return <main className="auth-page"><section className="auth-card">Loading admin…</section></main>;
  if(!authorized)return <main className="auth-page"><section className="auth-card"><h1>Admin access required</h1><p className="auth-copy">This area is restricted to Jordan Ranch & Tamarron platform administrators.</p><Link href="/" className="btn-secondary" style={{textDecoration:"none"}}>Return Home</Link></section></main>;
  return <main className="auth-page"><section className="auth-card wide"><Link href="/" className="auth-brand">Jordan Ranch & Tamarron</Link><span className="badge">Platform Admin</span><h1>Admin Center</h1><p className="auth-copy">Manage private resident access, local business advertising, community content and support.</p>
    <article className="card"><div className="card-body"><MessageSquare size={24}/><div className="card-title">Support Inbox</div><div className="card-copy">Read resident and business requests, respond in-app and send transactional reply notifications.</div><div className="cta-row"><Link href="/admin/support" className="btn-primary" style={{textDecoration:"none",textAlign:"center"}}>Open Support Inbox</Link></div></div></article>
    <article className="card"><div className="card-body"><ShieldCheck size={24}/><div className="card-title">Resident Verifications</div><div className="card-copy">Review private residency submissions and approve or reject access.</div><div className="cta-row"><Link href="/admin/verifications" className="btn-primary" style={{textDecoration:"none",textAlign:"center"}}>Open Queue</Link></div></div></article>
    <article className="card"><div className="card-body"><Store size={24}/><div className="card-title">Business & Advertising</div><div className="card-copy">Verify businesses, activate plans, and approve image/video ads and Deals.</div><div className="cta-row"><Link href="/admin/advertising" className="btn-primary" style={{textDecoration:"none",textAlign:"center"}}>Open Advertising Admin</Link></div></div></article>
    <article className="card"><div className="card-body"><CalendarDays size={24}/><div className="card-title">Community Content</div><div className="card-copy">Publish Events, Coming Soon items, construction updates and resident notices.</div><div className="cta-row"><Link href="/admin/content" className="btn-primary" style={{textDecoration:"none",textAlign:"center"}}>Publish Content</Link></div></div></article>
  </section></main>;
}
