"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Business={id:string;name:string;category:string;profile_view_count:number;is_verified:boolean};
type Ad={id:string;headline:string;format:string;impression_count:number;video_play_count:number;click_count:number;is_active:boolean;approval_status:string};
type Deal={id:string;title:string;view_count:number;claim_count:number;is_active:boolean;approval_status:string};

export default function AdvertiserDashboard(){
 const [business,setBusiness]=useState<Business|null>(null);const [ads,setAds]=useState<Ad[]>([]);const [deals,setDeals]=useState<Deal[]>([]);const [plan,setPlan]=useState<string>("Get Listed");const [loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{const s=createClient();const {data:u}=await s.auth.getUser();if(!u.user){window.location.href="/advertise/signup";return;}const {data:b}=await s.from("businesses").select("id,name,category,profile_view_count,is_verified").eq("owner_user_id",u.user.id).order("created_at",{ascending:false}).limit(1).maybeSingle();if(!b){window.location.href="/advertise/setup";return;}setBusiness(b);const [{data:a},{data:d},{data:sub}]=await Promise.all([s.from("business_ads").select("id,headline,format,impression_count,video_play_count,click_count,is_active,approval_status").eq("business_id",b.id).order("created_at",{ascending:false}),s.from("deals").select("id,title,view_count,claim_count,is_active,approval_status").eq("business_id",b.id).order("created_at",{ascending:false}),s.from("business_plan_subscriptions").select("plan_code,status,advertising_plans(name)").eq("business_id",b.id).in("status",["pending","active"]).order("created_at",{ascending:false}).limit(1).maybeSingle()]);setAds((a??[]) as Ad[]);setDeals((d??[]) as Deal[]);if(sub){const p=sub.advertising_plans as unknown as {name?:string}|null;setPlan(`${p?.name??sub.plan_code} · ${sub.status}`);}setLoading(false);})();},[]);
 if(loading)return <main className="auth-page"><section className="auth-card">Loading business dashboard…</section></main>;
 if(!business)return null;
 return <main className="auth-page"><section className="auth-card wide">
  <Link href="/advertise" className="auth-brand">Jordan Ranch & Tamarron</Link><span className="badge sponsored">Advertiser Dashboard</span>
  <h1>{business.name}</h1><p className="auth-copy">{business.category} · {business.is_verified?"Verified business":"Business verification pending"} · {business.profile_view_count} profile views</p>
  <article className="card"><div className="card-body"><div className="eyebrow">Advertising Plan</div><div className="card-title">{plan}</div><div className="cta-row"><Link className="btn-primary" href="/advertise/plans" style={{textAlign:"center",textDecoration:"none"}}>View Advertising Plans</Link></div></div></article>
  <div className="cta-row"><Link className="btn-primary" href="/advertise/campaign/new" style={{textAlign:"center",textDecoration:"none"}}>Create Ad Campaign</Link><Link className="btn-secondary" href="/advertise/deal/new" style={{textDecoration:"none"}}>Create Resident Deal</Link></div>
  <div className="section" style={{marginTop:22}}><div className="section-title">Campaigns</div>{ads.length===0?<p className="auth-copy">No campaigns yet. Create an image, video or Coming Soon ad.</p>:ads.map(a=><article className="card" key={a.id}><div className="card-body"><span className={`badge ${a.approval_status!=="approved"?"sponsored":""}`}>{a.approval_status==="approved"&&a.is_active?"Active":a.approval_status==="pending"?"Pending Review":a.approval_status}</span><div className="card-title">{a.headline}</div><div className="meta"><span>{a.format}</span><span>{a.impression_count} impressions</span><span>{a.video_play_count} video plays</span><span>{a.click_count} clicks</span></div></div></article>)}</div>
  <div className="section"><div className="section-title">Resident Deals</div>{deals.length===0?<p className="auth-copy">No resident deals yet.</p>:deals.map(d=><article className="card" key={d.id}><div className="card-body"><span className="badge">{d.approval_status==="approved"&&d.is_active?"Active":d.approval_status==="pending"?"Pending Review":d.approval_status}</span><div className="card-title">{d.title}</div><div className="meta"><span>{d.view_count} views</span><span>{d.claim_count} claims</span></div></div></article>)}</div>
 </section></main>;
}
