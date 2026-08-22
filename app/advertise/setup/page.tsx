"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BusinessSetupPage() {
  const router = useRouter();
  const [name,setName]=useState("");
  const [category,setCategory]=useState("Restaurants");
  const [description,setDescription]=useState("");
  const [address,setAddress]=useState("");
  const [phone,setPhone]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  useEffect(()=>{ const s=createClient(); s.auth.getUser().then(({data})=>{ if(!data.user) router.replace("/advertise/signup"); }); },[router]);

  async function submit(e:FormEvent){
    e.preventDefault(); setLoading(true); setError("");
    const s=createClient(); const {data}=await s.auth.getUser(); const user=data.user;
    if(!user){router.replace("/advertise/signup");return;}
    const {data:business,error}=await s.from("businesses").insert({owner_user_id:user.id,name:name.trim(),category,description:description.trim()||null,address:address.trim()||null,phone:phone.trim()||null,is_claimed:true}).select("id").single();
    if(error){setError(error.message);setLoading(false);return;}
    router.push(`/advertise/dashboard?business=${business.id}`);
  }

  return <main className="auth-page"><section className="auth-card wide">
    <Link href="/advertise" className="auth-brand">Jordan Ranch & Tamarron</Link>
    <span className="badge sponsored">Business Setup</span><h1>Add your business</h1>
    <p className="auth-copy">Create the profile residents will discover in Local Business. Paid promotion can be added after setup.</p>
    <form onSubmit={submit} className="form-stack">
      <label>Business name<input required value={name} onChange={e=>setName(e.target.value)} /></label>
      <label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{["Restaurants","Medical","Dental","Beauty","Home Services","Fitness","Childcare","Automotive","Shopping","Real Estate","Professional Services"].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} /></label>
      <div className="form-grid two"><label>Business address<input value={address} onChange={e=>setAddress(e.target.value)} /></label><label>Phone<input value={phone} onChange={e=>setPhone(e.target.value)} /></label></div>
      {error&&<div className="form-error">{error}</div>}<button className="btn-primary" disabled={loading}>{loading?"Saving…":"Create Business Profile"}</button>
    </form>
  </section></main>;
}
