"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LeaderboardStatus={businessName:string;category:string;currentBid:number;rank:number|null;nextBid:number;activeSubscription:boolean};

export default function AdvertisingPlansPage(){
 const [status,setStatus]=useState<LeaderboardStatus|null>(null);
 const [bid,setBid]=useState("25");
 const [pending,setPending]=useState(false);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");

 useEffect(()=>{(async()=>{
  const s=createClient();
  const {data:u}=await s.auth.getUser();
  if(!u.user){window.location.href="/advertise/signup";return;}
  const {data:b}=await s.from("businesses").select("id").eq("owner_user_id",u.user.id).order("created_at",{ascending:false}).limit(1).maybeSingle();
  if(!b){window.location.href="/advertise/setup";return;}
  try{
   const r=await fetch("/api/advertise/leaderboard",{cache:"no-store"});
   const j=await r.json();
   if(r.ok){setStatus(j);setBid(String(Math.max(j.nextBid||10,j.currentBid||10)));}
  }catch{}
  const params=new URLSearchParams(window.location.search);
  if(params.get("payment")==="canceled")setMessage("Checkout was canceled. Your free business listing remains saved.");
 })();},[]);

 async function submitBid(e:FormEvent){
  e.preventDefault();setError("");setMessage("");
  const amount=Math.floor(Number(bid));
  if(!Number.isFinite(amount)||amount<10){setError("Enter a monthly bid of at least $10.");return;}
  if(status?.activeSubscription){setError("You already have an active leaderboard subscription. Use Manage Billing from your dashboard to cancel it before starting a new bid.");return;}
  setPending(true);
  try{
   const r=await fetch("/api/advertise/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bidAmount:amount})});
   const j=await r.json();
   if(!r.ok)throw new Error(j.error||"Unable to start payment");
   window.location.href=j.url;
  }catch(e){setError(e instanceof Error?e.message:"Unable to start payment");setPending(false);}
 }

 return <main className="auth-page"><section className="auth-card wide">
  <Link href="/advertise/dashboard" className="auth-brand">JRT.Community</Link>
  <span className="badge sponsored">Sponsored Leaderboard</span>
  <h1>Choose your visibility bid</h1>
  <p className="auth-copy">Your business listing is free. A paid monthly bid only controls your position in the Sponsored Leaderboard for your category. Higher active bids rank above lower active bids.</p>
  {status&&<div className="plan-grid">
   <article className="plan-card"><h3>Current position</h3><div className="plan-price">{status.rank?`#${status.rank}`:"Organic"}</div><p className="plan-meta">{status.category}</p></article>
   <article className="plan-card"><h3>Current bid</h3><div className="plan-price">${status.currentBid}/mo</div><p className="plan-meta">$0 means your listing remains in the free directory.</p></article>
   <article className="plan-card"><h3>Suggested next bid</h3><div className="plan-price">${status.nextBid}/mo</div><p className="plan-meta">The amount currently needed to improve your sponsored position based on active bids.</p></article>
  </div>}
  {error&&<div className="form-error">{error}</div>}{message&&<div className="form-success">{message}</div>}
  <form className="form-stack" onSubmit={submitBid} style={{marginTop:18}}>
   <label>Monthly visibility bid<input type="number" min="10" step="1" inputMode="numeric" value={bid} onChange={e=>setBid(e.target.value)} /></label>
   <div className="private-note">Minimum bid: $10/month. Paid placement is labeled Sponsored to residents. A higher bid improves placement but does not guarantee impressions, leads, sales or resident ratings.</div>
   <button className="btn-primary" disabled={pending||Boolean(status?.activeSubscription)}>{pending?"Opening secure checkout…":status?.activeSubscription?"Active Bid Already Running":"Start Sponsored Bid"}</button>
  </form>
  <Link href="/advertise/dashboard" className="btn-secondary" style={{display:"block",textAlign:"center",textDecoration:"none",marginTop:12}}>Back to Business Dashboard</Link>
 </section></main>;
}
