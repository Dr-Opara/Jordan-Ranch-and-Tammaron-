import Link from "next/link";

const plans = [
  { name: "Get Listed", price: "$0", text: "Standard Local Business directory presence." },
  { name: "Get Noticed", price: "$49/mo", text: "Enhanced profile, priority Local placement and resident deals." },
  { name: "Get Featured", price: "$99/mo", text: "Featured Local placement plus image and video campaigns." },
  { name: "Get Everywhere", price: "$199/mo", text: "Home feed, Local Business, Deals, video and Coming Soon placement." },
];

export default function AdvertisePage() {
  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <Link href="/" className="auth-brand">Jordan Ranch & Tamarron</Link>
        <span className="badge sponsored">For Local Businesses</span>
        <h1>Get noticed by residents</h1>
        <p className="auth-copy">Reach verified Jordan Ranch and Tamarron residents with business profiles, image ads, short video ads, resident-only deals and featured placement. Advertisers do not receive access to the private resident marketplace.</p>
        <div className="plan-grid">
          {plans.map((plan) => (
            <article className="plan-card" key={plan.name}>
              <h3>{plan.name}</h3>
              <div className="plan-price">{plan.price}</div>
              <p className="plan-meta">{plan.text}</p>
            </article>
          ))}
        </div>
        <div className="cta-row" style={{ marginTop: 18 }}>
          <Link className="btn-primary" href="/advertise/signup" style={{ textAlign: "center", textDecoration: "none" }}>Create Business Account</Link>
          <Link className="btn-secondary" href="/login" style={{ textAlign: "center", textDecoration: "none" }}>Business Sign In</Link>
        </div>
      </section>
    </main>
  );
}
