import Link from "next/link";

const steps = [
  { name: "List Free", price: "$0", text: "Create a reviewed Local Business profile and appear in the resident directory." },
  { name: "Choose Your Bid", price: "You decide", text: "Set a monthly visibility bid for the Sponsored Leaderboard in your business category." },
  { name: "Move Up", price: "Compete", text: "Higher active bids rank above lower bids. Increase your placement as local competition changes." },
];

export default function AdvertisePage() {
  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <Link href="/" className="auth-brand">JRT.Community</Link>
        <span className="badge sponsored">For Local Businesses</span>
        <h1>Get seen on the local business leaderboard</h1>
        <p className="auth-copy">List your business free for verified Jordan Ranch and Tamarron residents. When you want more visibility, choose your own monthly bid to compete for a higher position on the Sponsored Leaderboard. There are no fixed advertising tiers.</p>
        <div className="plan-grid">
          {steps.map((step) => (
            <article className="plan-card" key={step.name}>
              <h3>{step.name}</h3>
              <div className="plan-price">{step.price}</div>
              <p className="plan-meta">{step.text}</p>
            </article>
          ))}
        </div>
        <div className="private-note" style={{marginTop:16}}><strong>How ranking works:</strong> paid positions are clearly labeled Sponsored. Placement is based on the active monthly visibility bid, not resident ratings. Resident ratings remain independent and cannot be purchased. All business listings are reviewed before becoming visible.</div>
        <div className="cta-row" style={{ marginTop: 18 }}>
          <Link className="btn-primary" href="/advertise/signup" style={{ textAlign: "center", textDecoration: "none" }}>List Your Business Free</Link>
          <Link className="btn-secondary" href="/advertise/login" style={{ textAlign: "center", textDecoration: "none" }}>Business Sign In</Link>
        </div>
      </section>
    </main>
  );
}
