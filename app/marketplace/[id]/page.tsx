import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, MapPin, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  await supabase.rpc("record_listing_view", { p_listing_id: id });
  const { data: listing } = await supabase.from("marketplace_listings").select("id,seller_id,title,description,price,category,community,image_urls,view_count,created_at,status").eq("id", id).maybeSingle();
  if (!listing || listing.status !== "active") notFound();
  const { data: seller } = await supabase.from("profiles").select("id,first_name,last_initial,profile_photo_url,community,profession,business_name,member_since,verification_status").eq("id", listing.seller_id).maybeSingle();
  const community = listing.community === "jordan_ranch" ? "Jordan Ranch" : "Tamarron";
  return <main className="auth-page"><section className="auth-card wide">
    <Link href="/" className="auth-brand">Jordan Ranch & Tamarron</Link>
    <span className="badge">Marketplace</span>
    {listing.image_urls?.[0] ? <div className="listing-hero" style={{backgroundImage:`url(${listing.image_urls[0]})`}} /> : <div className="media-placeholder">Listing photo</div>}
    <h1>{listing.title}</h1>
    <div className="plan-price">{listing.price === null ? "Free" : `$${Number(listing.price).toLocaleString()}`}</div>
    <div className="meta"><span><MapPin size={12}/> {community}</span><span><Eye size={12}/> {listing.view_count} views</span><span>{listing.category}</span></div>
    {listing.description && <p className="auth-copy" style={{marginTop:16}}>{listing.description}</p>}
    {seller && seller.verification_status === "verified" && <article className="card"><div className="card-body"><div className="eyebrow">Seller</div><div className="card-title">{seller.first_name} {seller.last_initial}.</div><div className="meta"><span><ShieldCheck size={12}/> Verified {seller.community === "jordan_ranch" ? "Jordan Ranch" : "Tamarron"} Resident</span></div>{seller.profession && <div className="card-copy">{seller.profession}</div>}{seller.business_name && <div className="card-copy">Business: {seller.business_name}</div>}<div className="cta-row"><Link href={`/resident/${seller.id}`} className="btn-primary" style={{textDecoration:"none",textAlign:"center"}}>View Resident Profile</Link></div></div></article>}
    <div className="private-note">Marketplace listings have no likes or comment threads. Resident addresses are never shown.</div>
  </section></main>;
}
