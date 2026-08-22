import Link from "next/link";
import { Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic="force-dynamic";

export default async function ComingSoonPage(){
 const s=await createClient();
 const [updates,ads]=await Promise.all([
  s.from("community_updates").select("id,title,body,category,published_at").eq("category","coming_soon").order("published_at",{ascending:false}).limit(30),
  s.from("business_ads").select("id,headline,body,media_urls,businesses(id,name)").eq("format","coming_soon").eq("approval_status","approved").eq("is_active",true).order("created_at",{ascending:false}).limit(30)
 ]);
 return <main className="auth-page"><section className="auth-card wide"><Link href="/" className="auth-brand">Jordan Ranch & Tamarron</Link><span className="badge"><Building2 size={13}/> Coming Soon</span><h1>What’s coming nearby</h1><p className="auth-copy">New businesses, commercial openings and community development updates for verified residents.</p>{(updates.data??[]).map(u=><article className="card" key={u.id}><div className="card-body"><div className="eyebrow">Community Update</div><div className="card-title">{u.title}</div>{u.body&&<div className="card-copy">{u.body}</div>}</div></article>)}{(ads.data??[]).map((a:any)=><article className="card" key={a.id}>{a.media_urls?.[0]&&<div className="media-placeholder" style={{backgroundImage:`url(${a.media_urls[0]})`,backgroundSize:"cover",backgroundPosition:"center"}}/>}<div className="card-body"><span className="badge sponsored">Sponsored · Coming Soon</span><div className="card-title">{a.headline}</div>{a.body&&<div className="card-copy">{a.body}</div>}{a.businesses?.id&&<Link href={`/business/${a.businesses.id}`} className="section-link">View business →</Link>}</div></article>)}{(updates.data??[]).length===0&&(ads.data??[]).length===0&&<article className="card"><div className="card-body"><div className="card-title">Nothing posted yet</div><div className="card-copy">Confirmed openings and development updates will appear here.</div></div></article>}</section></main>;
}
