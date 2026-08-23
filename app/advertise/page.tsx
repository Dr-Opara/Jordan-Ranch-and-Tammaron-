import Link from "next/link";

const plans = [
  { name: "Get Listed", price: "$99/mo", text: "Standard Local Business directory listing." },
  { name: "Get Noticed", price: "$199/mo", text: "Enhanced profile, priority Local Business placement and resident deals." },
  { name: "Get Featured", price: "$299/mo", text: "Priority Local Business placement plus image and video campaigns." },
  { name: "Get Everywhere", price: "$399/mo", text: "Home feed, Local Business, Deals, image/video campaigns and Coming Soon placement." },
];

export default function AdvertisePage() {
  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <Link href="/" className="auth-brand">Jordan Ranch & Tamarron</Link>
        <span className="badge sponsored">For Local Businesses</span>
        <h1>Get noticed by residents</h1>
        <p className="auth-copy">Reach verified Jordan Ranch and Tamarron residents with paid business listings, priority placement, resident deals, image/video advertising and Coming Soon promotion. Advertisers never receive access to the private resident marketplace.</p>
        <div className="plan-grid">
          {plans.map((plan) => (
            <article className="plan-card" key={plan.name}>
              <h3>{plan.name}</h3>
              <div className="plan-price">{plan.price}</div>
              <p className="plan-meta">{plan.text}</p>
            </article>
          ))}
        </div>
        <div className="private-note" style={{marginTop:16}}>All business listings are reviewed before they become visible to residents. Payment is collected securely through Stripe; this app does not store card or bank-card numbers.</div>
        <div className="cta-row" style={{ marginTop: 18 }}>
          <Link className="btn-primary" href="/advertise/signup" style={{ textAlign: "center", textDecoration: "none" }}>Create Business Account</Link>
          <Link className="btn-secondary" href="/login" style={{ textAlign: "center", textDecoration: "none" }}>Business Sign In</Link>
        </div>
      </section>
    </main>
  );
}
