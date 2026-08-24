"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PRODUCTION_SITE_URL = "https://jrt.community";

export default function AdvertiserSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError(""); setMessage("");
    const supabase = createClient();
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const siteUrl = configured || PRODUCTION_SITE_URL;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/confirm?next=/policy-agreement?account_type=advertiser&account_type=advertiser`,
        data: { account_type: "advertiser" },
      },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data.session) { router.push("/policy-agreement?account_type=advertiser"); return; }
    setMessage("Check your email to confirm your business account. After confirmation, you’ll review the business terms and policies before setup.");
    setLoading(false);
  }

  return (
    <main className="auth-page"><section className="auth-card">
      <Link href="/advertise" className="auth-brand">Jordan Ranch & Tamarron</Link>
      <span className="badge sponsored">Business Advertising</span>
      <h1>Create a business account</h1>
      <p className="auth-copy">This account manages your business listing, ads and resident deals. It does not unlock resident-only content.</p>
      <form onSubmit={submit} className="form-stack">
        <label>Business email<input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} /></label>
        <label>Password<input type="password" minLength={8} required value={password} onChange={(e)=>setPassword(e.target.value)} /></label>
        {error && <div className="form-error">{error}</div>}{message && <div className="form-success">{message}</div>}
        <button className="btn-primary" disabled={loading}>{loading ? "Creating…" : "Create Business Account"}</button>
      </form>
    </section></main>
  );
}
