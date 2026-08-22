import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic="force-dynamic";

export default async function EventsPage(){
 const s=await createClient();const {data:events}=await s.from("community_events").select("id,title,description,location,starts_at,ends_at").gte("starts_at",new Date().toISOString()).order("starts_at",{ascending:true}).limit(50);
 return <main className="auth-page"><section className="auth-card wide"><Link href="/" className="auth-brand">Jordan Ranch & Tamarron</Link><span className="badge"><CalendarDays size={13}/> Resident Events</span><h1>Upcoming events</h1><p className="auth-copy">Community events visible to verified residents. No comments or likes.</p>{(events??[]).length===0?<article className="card"><div className="card-body"><div className="card-title">No upcoming events posted yet</div></div></article>:(events??[]).map(e=><article className="card" key={e.id}><div className="card-body"><div className="eyebrow">{new Date(e.starts_at).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</div><div className="card-title">{e.title}</div>{e.description&&<div className="card-copy">{e.description}</div>}<div className="meta"><span>{new Date(e.starts_at).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"})}</span>{e.location&&<span><MapPin size={12}/> {e.location}</span>}</div></div></article>)}</section></main>;
}
