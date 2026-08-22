import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic="force-dynamic";

export default async function SavedPage(){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)return null;
 const [m,b,d]=await Promise.all([
  s.from("saved_marketplace").select("listing_id,marketplace_listings(id,title,price,community,status)").eq("user_id",user.id).order("created_at",{ascending:false}),
  s.from("saved_businesses").select("business_id,businesses(id,name,category,average_rating)").eq("user_id",user.id).order("created_at",{ascending:false}),
  s.from("saved_deals").select("deal_id,deals(id,title,expires_at,businesses(name))").eq("user_id",user.id).order("created_at",{ascending:false})
 ]);
 return <main className="auth-page"><section className="auth-card wide"><Link href="/" className="auth-brand">Jordan Ranch & Tamarron</Link><span className="badge">Private to You</span><h1>Saved content</h1><p className="auth-copy">Only you can see the content you save.</p>
  <div className="section"><div className="section-title">Marketplace</div>{(m.data??[]).length===0?<p className="auth-copy">No saved listings.</p>:(m.data??[]).map((x:any)=>x.marketplace_listings&&<article className="card" key={x.listing_id}><div className="card-body"><div className="card-title">{x.marketplace_listings.title}</div><div className="meta"><span>{x.marketplace_listings.price===null?"Free":`$${Number(x.marketplace_listings.price).toLocaleString()}`}</span></div><Link href={`/marketplace/${x.listing_id}`} className="section-link">View listing →</Link></div></article>)}</div>
  <div className="section"><div className="section-title">Businesses</div>{(b.data??[]).length===0?<p className="auth-copy">No saved businesses.</p>:(b.data??[]).map((x:any)=>x.businesses&&<article className="card" key={x.business_id}><div className="card-body"><div className="card-title">{x.businesses.name}</div><div className="meta"><span>{x.businesses.category}</span><span>{Number(x.businesses.average_rating).toFixed(1)} ★</span></div><Link href={`/business/${x.business_id}`} className="section-link">View business →</Link></div></article>)}</div>
  <div className="section"><div className="section-title">Deals</div>{(d.data??[]).length===0?<p className="auth-copy">No saved deals.</p>:(d.data??[]).map((x:any)=>x.deals&&<article className="card" key={x.deal_id}><div className="card-body"><div className="card-title">{x.deals.title}</div><div className="meta"><span>{x.deals.businesses?.name}</span><span>Expires {new Date(x.deals.expires_at).toLocaleDateString()}</span></div></div></article>)}</div>
 </section></main>;
}
