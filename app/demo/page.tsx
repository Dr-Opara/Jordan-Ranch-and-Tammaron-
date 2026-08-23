"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, ShoppingBag, Store, Tags, User, CalendarDays, Building2, PlusCircle, Eye, MapPin, ShieldCheck, Bookmark, BadgePercent } from "lucide-react";

type Tab = "home" | "marketplace" | "business" | "deals" | "profile";

const listings = [
  { id: 1, title: "Peloton Bike+", price: 850, community: "Jordan Ranch", views: 126, category: "Fitness" },
  { id: 2, title: "6-seat patio dining set", price: 325, community: "Tamarron", views: 84, category: "Home" },
  { id: 3, title: "Kids electric ride-on Jeep", price: 140, community: "Jordan Ranch", views: 61, category: "Kids" },
  { id: 4, title: "Free moving boxes", price: 0, community: "Tamarron", views: 49, category: "Free" },
  { id: 5, title: "Saturday Yard Sale", price: null as number | null, community: "Jordan Ranch", views: 203, category: "Yard Sale" },
];

const businesses = [
  { id: 1, name: "Jordan Ranch Dental", category: "Dental", rating: 4.9, ratings: 87, views: 412, description: "Family and cosmetic dentistry serving nearby residents." },
  { id: 2, name: "Tamarron Family Cleaners", category: "Cleaning", rating: 4.8, ratings: 54, views: 281, description: "Local residential cleaning with resident scheduling." },
  { id: 3, name: "West Katy HVAC", category: "Home Services", rating: 4.7, ratings: 103, views: 533, description: "Heating and cooling service for Jordan Ranch and Tamarron." },
];

const deals = [
  { id: 1, title: "20% Off First Cleaning", business: "Tamarron Family Cleaners", views: 238, claims: 41, expires: "Sep 30" },
  { id: 2, title: "$50 Off HVAC Service", business: "West Katy HVAC", views: 311, claims: 57, expires: "Oct 15" },
  { id: 3, title: "Free Whitening Consultation", business: "Jordan Ranch Dental", views: 192, claims: 29, expires: "Oct 31" },
];

export default function DemoPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [marketSearch, setMarketSearch] = useState("");
  const [businessSearch, setBusinessSearch] = useState("");
  const [businessCategory, setBusinessCategory] = useState("All");
  const [savedListings, setSavedListings] = useState<number[]>([]);
  const [savedBusinesses, setSavedBusinesses] = useState<number[]>([]);
  const [savedDeals, setSavedDeals] = useState<number[]>([]);
  const [claimed, setClaimed] = useState<number[]>([]);
  const [notice, setNotice] = useState("");

  const filteredListings = useMemo(() => listings.filter(x => `${x.title} ${x.category}`.toLowerCase().includes(marketSearch.toLowerCase())), [marketSearch]);
  const filteredBusinesses = useMemo(() => businesses.filter(x => (businessCategory === "All" || x.category === businessCategory) && `${x.name} ${x.category} ${x.description}`.toLowerCase().includes(businessSearch.toLowerCase())), [businessSearch, businessCategory]);

  function toggle(list:number[], setter:(v:number[])=>void, id:number){ setter(list.includes(id) ? list.filter(x=>x!==id) : [...list,id]); }
  function go(next:Tab){ setNotice(""); setTab(next); }
  function show(text:string){ setNotice(text); window.scrollTo({top:0,behavior:"smooth"}); }
  function priceText(item:(typeof listings)[number]){ return item.price===0 ? "Free" : item.price===null ? "Yard Sale" : `$${item.price.toLocaleString()}`; }

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-row"><div className="brand">Jordan Ranch & Tamarron</div><button className="community-pill">Jordan Ranch</button></div>
      <div className="counter-card" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}><div className="counter-main">1,842 Verified Residents</div><div className="counter-sub" style={{marginTop:0,textAlign:"right"}}>Jordan Ranch 1,066 · Tamarron 776</div></div>
      <div style={{marginTop:8,fontSize:11,color:"#6b7280",fontWeight:700}}>DEMO PREVIEW · sample data only</div>
    </header>

    {notice && <div style={{margin:"12px 16px 0",padding:"12px 14px",borderRadius:12,background:"#ecfdf5",color:"#166534",fontSize:13,fontWeight:700}}>{notice}</div>}

    {tab === "home" && <main className="content">
      <section className="section"><div className="quick-grid">
        <button className="quick-card" onClick={()=>show("Coming Soon opened — this will show new businesses, construction and openings around Jordan Ranch & Tamarron.")}><Building2 size={21}/><span className="quick-label">Coming Soon</span></button>
        <button className="quick-card" onClick={()=>show("Events opened — upcoming Jordan Ranch & Tamarron community events will appear here.")}><CalendarDays size={21}/><span className="quick-label">Events</span></button>
        <button className="quick-card" onClick={()=>router.push("/marketplace/new")}><PlusCircle size={21}/><span className="quick-label">Post Item</span></button>
        <button className="quick-card" onClick={()=>go("business")}><Store size={21}/><span className="quick-label">Find Business</span></button>
      </div></section>
      <section className="section"><div className="section-head"><div className="section-title">Around the Communities</div></div>
        <article className="card"><div className="card-body"><div className="eyebrow">Community update</div><div className="card-title">New retail center progressing near Jordan Ranch</div><div className="card-copy">Construction is moving forward on additional neighborhood retail and service space.</div><div className="meta"><span>Today</span><span><Eye size={12}/> 687 views</span></div></div></article>
        <article className="card" onClick={()=>show("Event details opened: Jordan Ranch Fall Family Night · Sep 12 · 6:00 PM · The Shed")}><div className="card-body"><span className="badge"><CalendarDays size={13}/> Event</span><div className="card-title">Jordan Ranch Fall Family Night</div><div className="card-copy">Food trucks, music and resident activities.</div><div className="meta"><span>Sep 12 · 6:00 PM</span><span><MapPin size={12}/> The Shed</span></div></div></article>
        {listings.slice(0,3).map(item=><article className="card" key={item.id} onClick={()=>{go("marketplace");setMarketSearch(item.title);}}><div className="media-placeholder">Marketplace photo</div><div className="card-body"><span className="badge">{item.category==="Yard Sale"?"Yard Sale":item.price===0?"Free":"Marketplace"}</span><div className="card-title">{item.title} · {priceText(item)}</div><div className="meta"><span><MapPin size={12}/> {item.community}</span><span><Eye size={12}/> {item.views} views</span></div></div></article>)}
        <article className="card"><div className="media-placeholder">Sponsored image / video</div><div className="card-body"><span className="badge sponsored">Sponsored</span><div className="card-title">Now Open: Jordan Ranch Dental</div><div className="card-copy">New-patient appointments available for Jordan Ranch & Tamarron residents.</div><div className="meta"><span>Jordan Ranch Dental</span><span><Eye size={12}/> 1,204 views</span></div><div className="cta-row"><button className="btn-primary" onClick={()=>{go("business");setBusinessSearch("Jordan Ranch Dental");}}>View Business</button></div></div></article>
      </section>
    </main>}

    {tab === "marketplace" && <main className="content">
      <input className="search" placeholder="Search Marketplace" value={marketSearch} onChange={e=>setMarketSearch(e.target.value)}/>
      <div className="section-head" style={{marginTop:14}}><div className="section-title">Resident Marketplace</div><button className="section-link" onClick={()=>router.push("/marketplace/new")}>+ Post something</button></div>
      <div className="category-scroll">{["For Sale","Free","Yard Sale"].map(x=><button className="category-chip" key={x} onClick={()=>setMarketSearch(x==="For Sale"?"":x)}>{x}</button>)}</div>
      {filteredListings.map(item=><article className="card" key={item.id}><div className="media-placeholder">Resident listing photo</div><div className="card-body"><span className="badge">{item.category==="Yard Sale"?"Yard Sale":item.price===0?"Free":"For Sale"}</span><div className="card-title">{item.title} · {priceText(item)}</div><div className="meta"><span><ShieldCheck size={12}/> Verified resident</span><span>{item.community}</span><span><Eye size={12}/> {item.views} views</span></div><div className="cta-row"><button className="btn-primary" onClick={()=>show(`${item.title} opened. Seller profile, photos, description and contact action would appear here.`)}>View Listing</button><button className="btn-secondary" onClick={()=>toggle(savedListings,setSavedListings,item.id)}><Bookmark size={16}/> {savedListings.includes(item.id)?"Saved":"Save"}</button></div></div></article>)}
    </main>}

    {tab === "business" && <main className="content">
      <input className="search" placeholder="What local business are you looking for?" value={businessSearch} onChange={e=>setBusinessSearch(e.target.value)}/>
      <div className="category-scroll" style={{marginTop:10}}>{["All","Dental","Cleaning","Home Services"].map(x=><button className="category-chip" aria-pressed={businessCategory===x} key={x} onClick={()=>setBusinessCategory(x)}>{x}</button>)}</div>
      <section className="business-cta"><h3>Own a local business?</h3><p>Get noticed by verified Jordan Ranch & Tamarron residents with image ads, video ads, resident deals and featured placement.</p><button className="btn-primary" onClick={()=>router.push("/advertise")}>Advertise Your Business</button></section>
      <div className="section-head"><div className="section-title">Sponsored Businesses</div></div>
      <article className="card"><div className="media-placeholder">Local business video ad</div><div className="card-body"><span className="badge sponsored">Sponsored</span><div className="card-title">Grand Opening Special</div><div className="card-copy">Featured placement inside the Local Business tab.</div><div className="meta"><span>1,552 views</span><span>612 video plays</span></div><button className="btn-primary" style={{marginTop:12}} onClick={()=>setBusinessSearch("Jordan Ranch Dental")}>View Business</button></div></article>
      <div className="section-head"><div className="section-title">Local Businesses</div></div>
      {filteredBusinesses.map(b=><article className="card" key={b.id}><div className="card-body"><div className="card-title">{b.name}</div><div className="card-copy">{b.category} · {b.description}</div><div className="meta"><span>{b.rating.toFixed(1)} ★ · {b.ratings} ratings</span><span><Eye size={12}/> {b.views} profile views</span></div><div className="cta-row"><button className="btn-primary" onClick={()=>show(`${b.name} business profile opened. Hours, contact details, photos, rating and offers would appear here.`)}>View Business</button><button className="btn-secondary" onClick={()=>toggle(savedBusinesses,setSavedBusinesses,b.id)}><Bookmark size={16}/> {savedBusinesses.includes(b.id)?"Saved":""}</button></div></div></article>)}
    </main>}

    {tab === "deals" && <main className="content">
      <div className="section-head"><div className="section-title">Resident-Only Deals</div><span className="section-link">Verified access</span></div>
      {deals.map(d=><article className="card" key={d.id}><div className="card-body"><span className="badge"><BadgePercent size={13}/> Resident Deal</span><div className="card-title">{d.title} · {d.business}</div><div className="card-copy">Exclusive offer visible only to verified Jordan Ranch & Tamarron residents.</div><div className="meta"><span><Eye size={12}/> {d.views} views</span><span>{d.claims} claims</span><span>Expires {d.expires}</span></div><div className="cta-row"><button className="btn-primary" disabled={claimed.includes(d.id)} onClick={()=>setClaimed(c=>c.includes(d.id)?c:[...c,d.id])}>{claimed.includes(d.id)?"Claimed":"Claim Deal"}</button><button className="btn-secondary" onClick={()=>toggle(savedDeals,setSavedDeals,d.id)}>{savedDeals.includes(d.id)?"Saved":"Save"}</button></div></div></article>)}
    </main>}

    {tab === "profile" && <main className="content">
      <section className="card profile-card"><div className="avatar">EM</div><div className="profile-name">Emmanuel M.</div><div className="profile-detail">✓ Verified Jordan Ranch Resident</div><div className="profile-detail">Profession: Technology Consultant</div><div className="profile-detail">Business: Example Business LLC</div><div className="profile-detail">Member since August 2026</div><div className="private-note"><strong>Privacy:</strong> Full last name and residential address are used privately for verification and never displayed to other residents.</div></section>
      <section className="section"><div className="section-title" style={{marginBottom:10}}>My Private Content</div>
        <button className="card profile-link" onClick={()=>show(`Saved Content opened · ${savedListings.length} marketplace · ${savedBusinesses.length} businesses · ${savedDeals.length} deals`)}>Saved Content</button>
        <button className="card profile-link" onClick={()=>show("My Marketplace Listings opened — active, sold and archived resident listings will be managed here.")}>My Marketplace Listings</button>
        <button className="card profile-link" onClick={()=>show("Edit Profile opened — residents can update photo, profession and business while verified identity/address remain private.")}>Edit Profile</button>
        <button className="card profile-link" onClick={()=>show("Account & Verification opened — Verified Jordan Ranch Resident. Address and legal name remain private.")}>Account & Verification</button>
        <button className="btn-secondary" style={{width:"100%"}} onClick={()=>router.push("/login")}>Sign out</button>
      </section>
    </main>}

    <nav className="bottom-nav">
      <button className={`nav-btn ${tab==="home"?"active":""}`} onClick={()=>go("home")}><Home size={20}/><span>Home</span></button>
      <button className={`nav-btn ${tab==="marketplace"?"active":""}`} onClick={()=>go("marketplace")}><ShoppingBag size={20}/><span>Marketplace</span></button>
      <button className={`nav-btn ${tab==="business"?"active":""}`} onClick={()=>go("business")}><Store size={20}/><span>Local Business</span></button>
      <button className={`nav-btn ${tab==="deals"?"active":""}`} onClick={()=>go("deals")}><Tags size={20}/><span>Deals</span></button>
      <button className={`nav-btn ${tab==="profile"?"active":""}`} onClick={()=>go("profile")}><User size={20}/><span>Profile</span></button>
    </nav>
  </div>;
}
