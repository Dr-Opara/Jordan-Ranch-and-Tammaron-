"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Business={id:string;name:string;category:string;is_verified:boolean;created_at:string};
type PlanRequest={id:string;business_id:string;plan_code:string;status:string;created_at:string;businesses:{name:string}|null;advertising_plans:{name:string;price_monthly:number}|null};
type Ad={id:string;business_id:string;headline:string;format:string;placement_home:boolean;placement_local:boolean;approval_status:string;is_active:boolean;starts_at:string;ends_at:string;businesses:{name:string}|null};
type Deal={id:string;business_id:string;title:string;approval_status:string;is_active:boolean;starts_at:string;expires_at:string;businesses:{name:string}|null};

export default function AdvertisingAdminPage(){
  const [authorized,setAuthorized]=useState(false);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
  const [businesses,setBusinesses]=useState<Business[]>([]);const [plans,setPlans]=useState<PlanRequest[]>([]);const [ads,setAds]=useState<Ad[]>([]);const [deals,setDeals]=useState<Deal[]>([]);

  async function load(){
    const s=createClient();const {data:u}=await s.auth.getUser();if(!u.user){window.location.href="/login";return;}
    const {data:admin}=await s.from("app_admins").select("user_id").eq("user_id",u.user.id).maybeSingle();if(!admin){setAuthorized(false);setLoading(false);return;}setAuthorized(true);
    const [b,p,a,d]=await Promise.all([
      s.from("businesses").select("id,name,category,is_verified,created_at").eq("is_verified",false).order("created_at",{ascending:true}),
      s.from("business_plan_subscriptions").select("id,business_id,plan_code,status,created_at,businesses(name),advertising_plans(name,price_monthly)").eq("status","pending").order("created_at",{ascending:true}),
      s.from("business_ads").select("id,business_id,headline,format,placement_home,placement_local,approval_status,is_active,starts_at,ends_at,businesses(name)").eq("approval_status","pending").order("created_at",{ascending:true}),
      s.from("deals").select("id,business_id,title,approval_status,is_active,starts_at,expires_at,businesses(name)").eq("approval_status","pending").order("created_at",{ascending:true})
    ]);
    if(b.error||p.error||a.error||d.error)setError(b.error?.message||p.error?.message||a.error?.message||d.error?.message||"Unable to load admin queue");
    setBusinesses((b.data??[]) as Business[]);setPlans((p.data??[]) as unknown as PlanRequest[]);setAds((a.data??[]) as unknown as Ad[]);setDeals((d.data??[]) as unknown as Deal[]);setLoading(false);
  }
  useEffect(()=>{void load();},[]);

  async function verifyBusiness(id:string,approved:boolean){const s=createClient();setError("");const {error}=await s.from("businesses").update({is_verified:approved,updated_at:new Date().toISOString()}).eq("id",id);if(error){setError(error.message);return;}setBusinesses(prev=>prev.filter(x=>x.id!==id));}
  async function activatePlan(row:PlanRequest){const s=createClient();setError("");const starts=new Date();const ends=new Date(starts);ends.setMonth(ends.getMonth()+1);const {error}=await s.from("business_plan_subscriptions").update({status:"active",starts_at:starts.toISOString(),ends_at:ends.toISOString()}).eq("id",row.id);if(error){setError(error.message);return;}setPlans(prev=>prev.filter(x=>x.id!==row.id));}
  async function rejectPlan(id:string){const s=createClient();setError("");const {error}=await s.from("business_plan_subscriptions").update({status:"canceled"}).eq("id",id);if(error){setError(error.message);return;}setPlans(prev=>prev.filter(x=>x.id!==id));}
  async function reviewAd(row:Ad,approved:boolean){const s=createClient();setError("");const {error}=await s.from("business_ads").update({approval_status:approved?"approved":"rejected",is_active:approved}).eq("id",row.id);if(error){setError(error.message);return;}setAds(prev=>prev.filter(x=>x.id!==row.id));}
  async function reviewDeal(row:Deal,approved:boolean){const s=createClient();setError("");const {error}=await s.from("deals").update({approval_status:approved?"approved":"rejected",is_active:approved}).eq("id",row.id);if(error){setError(error.message);return;}setDeals(prev=>prev.filter(x=>x.id!==row.id));}

  if(loading)return <main className="auth-page"><section className="auth-card">Loading advertising approvals…</section></main>;
  if(!authorized)return <main className="auth-page"><section className="auth-card"><h1>Admin access required</h1><p className="auth-copy">This area is restricted to platform administrators.</p><Link href="/" className="btn-secondary" style={{textDecoration:"none"}}>Return Home</Link></section></main>;
  return <main className="auth-page"><section className="auth-card wide"><Link href="/" className="auth-brand">Jordan Ranch & Tamarron</Link><span className="badge">Admin</span><h1>Business & advertising approvals</h1><p className="auth-copy">Verify businesses, activate paid plans, and approve campaigns. Plan-entitlement checks run again when an ad or deal is approved.</p>{error&&<div className="form-error">{error}</div>}
    <section className="section"><div className="section-title">Business Verification</div>{businesses.length===0?<p className="auth-copy">No businesses awaiting verification.</p>:businesses.map(b=><article className="card" key={b.id}><div className="card-body"><div className="card-title">{b.name}</div><div className="meta"><span>{b.category}</span></div><div className="cta-row"><button className="btn-primary" onClick={()=>verifyBusiness(b.id,true)}>Verify Business</button><button className="btn-secondary" onClick={()=>verifyBusiness(b.id,false)}>Leave Unverified</button></div></div></article>)}</section>
    <section className="section"><div className="section-title">Plan Requests</div>{plans.length===0?<p className="auth-copy">No pending advertising plan requests.</p>:plans.map(p=><article className="card" key={p.id}><div className="card-body"><div className="card-title">{p.businesses?.name} · {p.advertising_plans?.name??p.plan_code}</div><div className="meta"><span>{p.advertising_plans?`$${Number(p.advertising_plans.price_monthly)}/mo`:p.plan_code}</span></div><div className="cta-row"><button className="btn-primary" onClick={()=>activatePlan(p)}>Activate 1 Month</button><button className="btn-secondary" onClick={()=>rejectPlan(p.id)}>Reject</button></div></div></article>)}</section>
    <section className="section"><div className="section-title">Ad Campaigns</div>{ads.length===0?<p className="auth-copy">No pending campaigns.</p>:ads.map(a=><article className="card" key={a.id}><div className="card-body"><span className="badge sponsored">Pending Review</span><div className="card-title">{a.headline}</div><div className="meta"><span>{a.businesses?.name}</span><span>{a.format}</span><span>{a.placement_home?"Home":""}{a.placement_home&&a.placement_local?" + ":""}{a.placement_local?"Local Business":""}</span></div><div className="cta-row"><button className="btn-primary" onClick={()=>reviewAd(a,true)}>Approve & Activate</button><button className="btn-secondary" onClick={()=>reviewAd(a,false)}>Reject</button></div></div></article>)}</section>
    <section className="section"><div className="section-title">Resident Deals</div>{deals.length===0?<p className="auth-copy">No pending Deals.</p>:deals.map(d=><article className="card" key={d.id}><div className="card-body"><span className="badge">Pending Review</span><div className="card-title">{d.title}</div><div className="meta"><span>{d.businesses?.name}</span></div><div className="cta-row"><button className="btn-primary" onClick={()=>reviewDeal(d,true)}>Approve & Activate</button><button className="btn-secondary" onClick={()=>reviewDeal(d,false)}>Reject</button></div></div></article>)}</section>
    <div className="cta-row"><Link href="/admin/verifications" className="btn-secondary" style={{textDecoration:"none"}}>Resident Verification Queue</Link></div>
  </section></main>;
}
