import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, MapPin, Phone, ShieldCheck } from "lucide-react";
import BusinessRating from "@/components/business-rating";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BusinessPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)notFound();
 await supabase.rpc("record_business_view",{p_business_id:id});
 const {data:b}=await supabase.from("businesses").select("id,name,category,description,address,phone,hours,logo_url,image_urls,is_verified,average_rating,rating_count,profile_view_count").eq("id",id).maybeSingle();if(!b)notFound();
 const {data:r}=await supabase.from("business_ratings").select("rating").eq("business_id",id).eq("user_id",user.id).maybeSingle();
 return <main className="auth-page"><section className="auth-card wide"><Link href="/" className="auth-brand">Jordan Ranch & Tamarron</Link>{b.is_verified&&<span className="badge"><ShieldCheck size={13}/> Verified Business</span>}{b.image_urls?.[0]?<div className="listing-hero" style={{backgroundImage:`url(${b.image_urls[0]})`}}/>:<div className="media-placeholder">Business photo</div>}<h1>{b.name}</h1><p className="auth-copy">{b.category}{b.description?` · ${b.description}`:""}</p><div className="meta"><span>{Number(b.average_rating).toFixed(1)} ★ · {b.rating_count} ratings</span><span><Eye size={12}/> {b.profile_view_count} profile views</span></div>{b.address&&<div className="meta"><span><MapPin size={12}/> {b.address}</span></div>}{b.phone&&<div className="meta"><span><Phone size={12}/> {b.phone}</span></div>}<article className="card" style={{marginTop:18}}><div className="card-body"><BusinessRating businessId={b.id} userId={user.id} initialRating={r?.rating??null}/></div></article><div className="private-note">Business ratings are resident star ratings only. Paid placement never changes a business’s rating.</div></section></main>;
}
