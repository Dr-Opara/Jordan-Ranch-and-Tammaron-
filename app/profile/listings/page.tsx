"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Listing={id:string;title:string;price:number|null;status:"active"|"sold"|"archived";view_count:number;created_at:string};
export default function MyListingsPage(){
 const [rows,setRows]=useState<Listing[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 async function load(){const s=createClient();const {data:u}=await s.auth.getUser();if(!u.user){window.location.href="/login";return;}const {data,error}=await s.from("marketplace_listings").select("id,title,price,status,view_count,created_at").eq("seller_id",u.user.id).order("created_at",{ascending:false});if(error)setError(error.message);else setRows((data??[]) as Listing[]);setLoading(false);}
 useEffect(()=>{load();},[]);
 async function setStatus(id:string,status:"active"|"sold"|"archived"){const s=createClient();const {error}=await s.from("marketplace_listings").update({status,updated_at:new Date().toISOString()}).eq("id",id);if(error){setError(error.message);return;}setRows(prev=>prev.map(x=>x.id===id?{...x,status}:x));}
 if(loading)return <main className="auth-page"><section className="auth-card">Loading listings…</section></main>;
 return <main className="auth-page"><section className="auth-card wide"><Link href="/" className="auth-brand">Jordan Ranch & Tamarron</Link><span className="badge">Private to You</span><h1>My Marketplace Listings</h1><div className="cta-row"><Link href="/marketplace/new" className="btn-primary" style={{textDecoration:"none",textAlign:"center"}}>Create New Listing</Link></div>{error&&<div className="form-error">{error}</div>}{rows.length===0?<p className="auth-copy" style={{marginTop:18}}>You have not listed anything yet.</p>:rows.map(x=><article className="card" key={x.id}><div className="card-body"><span className="badge">{x.status}</span><div className="card-title">{x.title}</div><div className="meta"><span>{x.price===null?"Free":`$${Number(x.price).toLocaleString()}`}</span><span>{x.view_count} views</span></div><div className="cta-row">{x.status!=="sold"&&<button className="btn-primary" onClick={()=>setStatus(x.id,"sold")}>Mark Sold</button>}{x.status!=="archived"&&<button className="btn-secondary" onClick={()=>setStatus(x.id,"archived")}>Archive</button>}{x.status!=="active"&&<button className="btn-secondary" onClick={()=>setStatus(x.id,"active")}>Reactivate</button>}</div></div></article>)}</section></main>;
}
