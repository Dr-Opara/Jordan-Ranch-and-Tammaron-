"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PolicyAgreementPage(){
  const router=useRouter();
  const [accepted,setAccepted]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [accountType,setAccountType]=useState<"resident"|"advertiser">("resident");
  const [ready,setReady]=useState(false);

  useEffect(()=>{void(async()=>{
    const s=createClient();
    const {data:{user}}=await s.auth.getUser();
    if(!user){router.replace("/login");return;}
    setAccountType(user.user_metadata?.account_type==="advertiser"?"advertiser":"resident");
    setReady(true);
  })();},[router]);

  const isBusiness=accountType==="advertiser";
  const links=useMemo(()=>isBusiness?[
    ["Terms of Service","/policies#terms"],
    ["Privacy Policy","/policies#privacy"],
    ["Business & Sponsored Leaderboard Terms","/policies#advertising"],
    ["Community Guidelines","/policies#community"],
    ["Account & Data Deletion","/policies#deletion"],
  ]:[
    ["Terms of Service","/policies#terms"],
    ["Privacy Policy","/policies#privacy"],
    ["Community Guidelines","/policies#community"],
    ["Marketplace Rules","/policies#marketplace"],
    ["Account & Data Deletion","/policies#deletion"],
  ],[isBusiness]);

  async function continueFlow(){
    if(!accepted)return;
    setLoading(true);setError("");
    const response=await fetch("/api/policy-acceptance",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({account_type:accountType})});
    const body=await response.json().catch(()=>({}));
    if(!response.ok){setError(body.error||"Unable to save your agreement.");setLoading(false);return;}
    window.location.assign(isBusiness?"/advertise/setup":"/verify-residency");
  }

  if(!ready)return <main className="auth-page"><section className="auth-card">Loading agreement…</section></main>;

  return <main className="auth-page"><section className="auth-card wide">
    <Link href="/" className="auth-brand">JRT.Community</Link>
    <span className="badge">Required Agreement</span>
    <h1>{isBusiness?"Business Terms & Policies":"Community Rules & Policies"}</h1>
    <p className="auth-copy">Before continuing, review this summary and agree to the policies that govern use of JRT.community.</p>

    <article className="card"><div className="card-body">
      <div className="card-title">Plain-language summary</div>
      {isBusiness?<div className="card-copy">Use accurate business information. Your reviewed directory listing is free. Sponsored Leaderboard placement is optional and uses a recurring monthly visibility bid processed by Stripe. Higher active bids receive higher paid placement, while resident ratings remain independent and cannot be purchased. JRT may reject or remove misleading, illegal, discriminatory, unsafe, or privacy-invasive content.</div>:<div className="card-copy">Be respectful and truthful. Do not harass, threaten, scam, impersonate others, post illegal items, or expose private residential information. Marketplace transactions are between residents, not JRT. Your verification information is private and used to confirm community eligibility. JRT may remove content or suspend accounts that violate the rules.</div>}
    </div></article>

    <div className="form-stack">
      {links.map(([label,href])=><Link key={href} href={href} target="_blank" className="card profile-link" style={{textDecoration:"none"}}>{label} ↗</Link>)}
      <label className="private-note" style={{display:"flex",gap:10,alignItems:"flex-start"}}><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} style={{marginTop:4}}/><span>I have read the summary and agree to the linked {isBusiness?"business terms and policies":"community rules and policies"}.</span></label>
      {error&&<div className="form-error">{error}</div>}
      <button className="btn-primary" disabled={!accepted||loading} onClick={continueFlow}>{loading?"Saving agreement…":"Agree & Continue"}</button>
    </div>
  </section></main>;
}
