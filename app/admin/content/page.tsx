"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode="event"|"update";
type Category="update"|"construction"|"coming_soon"|"notice";

export default function AdminContentPage(){
  const [authorized,setAuthorized]=useState(false);const [loading,setLoading]=useState(true);const [mode,setMode]=useState<Mode>("update");const [error,setError]=useState("");const [message,setMessage]=useState("");
  const [title,setTitle]=useState("");const [body,setBody]=useState("");const [category,setCategory]=useState<Category>("update");const [location,setLocation]=useState("");const [starts,setStarts]=useState("");const [ends,setEnds]=useState("");const [jr,setJr]=useState(true);const [tam,setTam]=useState(true);
  useEffect(()=>{(async()=>{const s=createClient();const {data:u}=await s.auth.getUser();if(!u.user){window.location.href="/login";return;}const {data:a}=await s.from("app_admins").select("user_id").eq("user_id",u.user.id).maybeSingle();setAuthorized(!!a);setLoading(false);})();},[]);
  async function submit(e:FormEvent){e.preventDefault();setError("");setMessage("");const s=createClient();const {data:u}=await s.auth.getUser();if(!u.user)return;if(!jr&&!tam){setError("Select at least one community.");return;}
    if(mode==="event"){
      const {error}=await s.from("community_events").insert({title:title.trim(),description:body.trim()||null,location:location.trim()||null,starts_at:new Date(starts).toISOString(),ends_at:ends?new Date(ends).toISOString():null,target_jordan_ranch:jr,target_tamarron:tam,created_by:u.user.id});if(error){setError(error.message);return;}setMessage("Event published to verified residents.");
    }else{
      const {error}=await s.from("community_updates").insert({title:title.trim(),body:body.trim()||null,category,target_jordan_ranch:jr,target_tamarron:tam,created_by:u.user.id});if(error){setError(error.message);return;}setMessage(category==="coming_soon"?"Coming Soon update published.":"Community update published.");
    }
    setTitle("");setBody("");setLocation("");setStarts("");setEnds("");
  }
  if(loading)return <main className="auth-page"><section className="auth-card">Loading content tools…</section></main>;
  if(!authorized)return <main className="auth-page"><section className="auth-card"><h1>Admin access required</h1><Link href="/" className="btn-secondary" style={{textDecoration:"none"}}>Return Home</Link></section></main>;
  return <main className="auth-page"><section className="auth-card wide"><Link href="/" className="auth-brand">Jordan Ranch & Tamarron</Link><span className="badge">Admin Content</span><h1>Publish community content</h1><p className="auth-copy">Post informational content only. Resident Home content has no likes or comment threads.</p>
    <div className="cta-row"><button className={mode==="update"?"btn-primary":"btn-secondary"} onClick={()=>setMode("update")}>Community Update</button><button className={mode==="event"?"btn-primary":"btn-secondary"} onClick={()=>setMode("event")}>Event</button></div>
    <form className="form-stack" onSubmit={submit} style={{marginTop:18}}><label>Title<input required maxLength={140} value={title} onChange={e=>setTitle(e.target.value)}/></label>{mode==="update"&&<label>Type<select value={category} onChange={e=>setCategory(e.target.value as Category)}><option value="update">General Update</option><option value="construction">Construction</option><option value="coming_soon">Coming Soon</option><option value="notice">Notice</option></select></label>}<label>Description<textarea maxLength={1500} value={body} onChange={e=>setBody(e.target.value)}/></label>
      {mode==="event"&&<><label>Location<input value={location} onChange={e=>setLocation(e.target.value)}/></label><div className="form-grid two"><label>Starts<input required type="datetime-local" value={starts} onChange={e=>setStarts(e.target.value)}/></label><label>Ends <span className="optional">optional</span><input type="datetime-local" value={ends} onChange={e=>setEnds(e.target.value)}/></label></div></>}
      <div className="eyebrow">Visible to</div><div className="form-grid two"><label><span><input type="checkbox" checked={jr} onChange={e=>setJr(e.target.checked)}/> Jordan Ranch</span></label><label><span><input type="checkbox" checked={tam} onChange={e=>setTam(e.target.checked)}/> Tamarron</span></label></div>{error&&<div className="form-error">{error}</div>}{message&&<div className="form-success">{message}</div>}<button className="btn-primary">Publish</button></form>
    <div className="cta-row" style={{marginTop:18}}><Link href="/admin/verifications" className="btn-secondary" style={{textDecoration:"none"}}>Resident Verifications</Link><Link href="/admin/advertising" className="btn-secondary" style={{textDecoration:"none"}}>Advertising Approvals</Link></div>
  </section></main>;
}
