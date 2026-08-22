"use client";

import { useState } from "react";
import {
  Home,
  Store,
  Tags,
  User,
  ShoppingBag,
  CalendarDays,
  Building2,
  BadgePercent,
  PlusCircle,
  Eye,
  MapPin,
  ShieldCheck,
  Play,
  Bookmark,
} from "lucide-react";

type Tab = "home" | "marketplace" | "business" | "deals" | "profile";

const residentCount = { total: 1248, jordan: 486, tamarron: 762 };

function TopBar() {
  return (
    <header className="topbar">
      <div className="brand-row">
        <div className="brand">Jordan Ranch & Tamarron</div>
        <button className="community-pill">Both Communities ▾</button>
      </div>
      <div className="counter-card">
        <div className="counter-main">{residentCount.total.toLocaleString()} Verified Residents</div>
        <div className="counter-sub">Jordan Ranch {residentCount.jordan} · Tamarron {residentCount.tamarron}</div>
      </div>
    </header>
  );
}

function HomeView() {
  return (
    <main className="content">
      <section className="section">
        <div className="quick-grid">
          <button className="quick-card"><Building2 size={21} /><span className="quick-label">Coming Soon</span></button>
          <button className="quick-card"><CalendarDays size={21} /><span className="quick-label">Events</span></button>
          <button className="quick-card"><PlusCircle size={21} /><span className="quick-label">Sell Item</span></button>
          <button className="quick-card"><Store size={21} /><span className="quick-label">Find Business</span></button>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><div className="section-title">Around the Communities</div></div>
        <article className="card">
          <div className="card-body">
            <div className="eyebrow">Community Update · Jordan Ranch</div>
            <div className="card-title">New retail construction is moving forward near the community</div>
            <div className="card-copy">Track openings, construction updates and important neighborhood information without comments or social-feed noise.</div>
            <div className="meta"><span>Posted today</span><span>View details →</span></div>
          </div>
        </article>

        <article className="card">
          <div className="media-placeholder">Marketplace photo</div>
          <div className="card-body">
            <span className="badge">Marketplace</span>
            <div className="card-title">West Elm dining table · $425</div>
            <div className="meta"><span><MapPin size={12} /> Jordan Ranch</span><span><Eye size={12} /> 94 views</span></div>
          </div>
        </article>

        <article className="card">
          <div className="media-placeholder"><Play size={36} />&nbsp; 15-sec local video ad</div>
          <div className="card-body">
            <span className="badge sponsored">Sponsored</span>
            <div className="card-title">Now open: neighborhood dental studio</div>
            <div className="card-copy">New patient offer exclusively for verified Jordan Ranch & Tamarron residents.</div>
            <div className="meta"><span><Eye size={12} /> 1,084 views</span><span>Video plays 612</span></div>
            <div className="cta-row"><button className="btn-primary">View Business</button><button className="btn-secondary">Save</button></div>
          </div>
        </article>

        <article className="card">
          <div className="card-body">
            <div className="eyebrow">Coming Soon · Tamarron</div>
            <div className="card-title">New restaurant joining the local corridor</div>
            <div className="card-copy">Opening information, resident offers and launch details will appear here as they are confirmed.</div>
            <div className="meta"><span>Opening soon</span><span>View details →</span></div>
          </div>
        </article>
      </section>
    </main>
  );
}

function MarketplaceView() {
  const listings = [
    ["Sectional sofa", "$650", "Tamarron", "212"],
    ["Kids bike", "$85", "Jordan Ranch", "71"],
    ["Patio set", "$320", "Jordan Ranch", "139"],
  ];
  return (
    <main className="content">
      <input className="search" placeholder="Search Marketplace" />
      <div className="category-scroll" style={{ marginTop: 10 }}>
        {['Furniture','Kids & Baby','Electronics','Home & Garden','Free Stuff'].map(x => <button key={x} className="category-chip">{x}</button>)}
      </div>
      <div className="section-head" style={{ marginTop: 10 }}><div className="section-title">Resident Marketplace</div><button className="section-link">+ Create listing</button></div>
      {listings.map(([name,price,community,views]) => (
        <article className="card" key={name}>
          <div className="media-placeholder">Listing photo</div>
          <div className="card-body">
            <div className="card-title">{name} · {price}</div>
            <div className="meta"><span><ShieldCheck size={12} /> Verified resident</span><span>{community}</span><span><Eye size={12} /> {views} views</span></div>
            <div className="cta-row"><button className="btn-primary">View Listing</button><button className="btn-secondary"><Bookmark size={16} /></button></div>
          </div>
        </article>
      ))}
    </main>
  );
}

function BusinessView() {
  const categories = ['Restaurants','Medical','Dental','Beauty','Home Services','Fitness','Childcare','Automotive','Shopping','Real Estate'];
  return (
    <main className="content">
      <input className="search" placeholder="What local business are you looking for?" />
      <div className="category-scroll" style={{ marginTop: 10 }}>{categories.map(x => <button key={x} className="category-chip">{x}</button>)}</div>

      <section className="business-cta">
        <h3>Own a local business?</h3>
        <p>Get noticed by verified Jordan Ranch & Tamarron residents with image ads, video ads, resident deals and featured placement.</p>
        <button className="btn-primary">Advertise Your Business</button>
      </section>

      <div className="section-head"><div className="section-title">Featured Businesses</div><span className="section-link">See all</span></div>
      <article className="card">
        <div className="media-placeholder"><Play size={34} />&nbsp; Sponsored video</div>
        <div className="card-body">
          <span className="badge sponsored">Sponsored</span>
          <div className="card-title">Heritage Family Dental</div>
          <div className="card-copy">Dental · New patient appointments available</div>
          <div className="meta"><span>4.9 ★ resident rating</span><span><Eye size={12} /> 1,508 ad views</span></div>
          <div className="cta-row"><button className="btn-primary">View Business</button><button className="btn-secondary">Directions</button></div>
        </div>
      </article>
      <article className="card">
        <div className="card-body">
          <span className="badge">Resident Favorite</span>
          <div className="card-title">Tamarron Mobile Detail</div>
          <div className="card-copy">Automotive · Serving both communities</div>
          <div className="meta"><span>4.8 ★ resident rating</span><span><Eye size={12} /> 634 profile views</span></div>
        </div>
      </article>
    </main>
  );
}

function DealsView() {
  return (
    <main className="content">
      <div className="section-head"><div className="section-title">Resident-Only Deals</div><span className="section-link">Verified access</span></div>
      {[['15% OFF','Local Italian Kitchen','Jordan Ranch & Tamarron residents','182'],['FREE Consultation','Neighborhood Home Services','Verified residents only','96'],['20% OFF','Grand Opening Offer','This weekend only','301']].map(([offer,business,copy,views]) => (
        <article className="card" key={offer+business}>
          <div className="card-body">
            <span className="badge"><BadgePercent size={13} /> Resident Deal</span>
            <div className="card-title">{offer} · {business}</div>
            <div className="card-copy">{copy}</div>
            <div className="meta"><span><Eye size={12} /> {views} views</span><span>Resident verification required</span></div>
            <div className="cta-row"><button className="btn-primary">Claim Deal</button><button className="btn-secondary">Save</button></div>
          </div>
        </article>
      ))}
    </main>
  );
}

function ProfileView() {
  return (
    <main className="content">
      <section className="card profile-card">
        <div className="avatar">EO</div>
        <div className="profile-name">Emmanuel O.</div>
        <div className="profile-detail">✓ Verified Jordan Ranch Resident</div>
        <div className="profile-detail">Profession: Cybersecurity Consultant</div>
        <div className="profile-detail">Business: ProcessPilot Technologies</div>
        <div className="profile-detail">Member since August 2026</div>
        <div className="private-note"><strong>Privacy:</strong> Your residential address is used for verification only and is never displayed to other residents.</div>
      </section>

      <section className="section">
        <div className="section-title" style={{ marginBottom: 10 }}>My Private Content</div>
        {['Saved Marketplace Listings','Saved Businesses','Saved Deals','My Marketplace Listings','Account & Verification','Notifications & Settings'].map(x => (
          <button key={x} className="card" style={{ width:'100%', textAlign:'left', padding:14, fontWeight:700, background:'white' }}>{x}</button>
        ))}
      </section>
    </main>
  );
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  return (
    <div className="app-shell">
      <TopBar />
      {tab === "home" && <HomeView />}
      {tab === "marketplace" && <MarketplaceView />}
      {tab === "business" && <BusinessView />}
      {tab === "deals" && <DealsView />}
      {tab === "profile" && <ProfileView />}

      <nav className="bottom-nav" aria-label="Primary">
        <button className={`nav-btn ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}><Home size={20} />Home</button>
        <button className={`nav-btn ${tab === 'marketplace' ? 'active' : ''}`} onClick={() => setTab('marketplace')}><ShoppingBag size={20} />Marketplace</button>
        <button className={`nav-btn ${tab === 'business' ? 'active' : ''}`} onClick={() => setTab('business')}><Store size={20} />Local Business</button>
        <button className={`nav-btn ${tab === 'deals' ? 'active' : ''}`} onClick={() => setTab('deals')}><Tags size={20} />Deals</button>
        <button className={`nav-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}><User size={20} />Profile</button>
      </nav>
    </div>
  );
}
