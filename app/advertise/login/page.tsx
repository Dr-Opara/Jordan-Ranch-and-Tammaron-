"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BusinessLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setError("");
    const supabase = createClient();
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (signInError || !data.user || !data.session) {
        setError(signInError?.message || "Unable to sign in.");
        return;
      }

      // Business sign-in is intentionally separate from resident authentication.
      // A resident account must never gain advertiser access simply by using this form.
      if (data.user.user_metadata?.account_type !== "advertiser") {
        await supabase.auth.signOut();
        setError("This is a resident account, not a business account. Use Resident Sign In or create a business account.");
        return;
      }

      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_user_id", data.user.id)
        .maybeSingle();

      if (businessError) {
        setError("We could not load your business account. Please try again.");
        return;
      }
      window.location.replace(business ? "/advertise/dashboard" : "/advertise/setup");
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page"><section className="auth-card">
      <Link href="/advertise" className="auth-brand">Jordan Ranch & Tamarron</Link>
      <span className="badge sponsored">Business Advertising</span>
      <h1>Business sign in</h1>
      <p className="auth-copy">Sign in to manage your business profile, plan, ads and resident deals.</p>
      <form onSubmit={submit} className="form-stack">
        <label>Business email<input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" /></label>
        <label>Password<input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="current-password" /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="btn-primary" disabled={loading}>{loading ? "Signing in…" : "Business Sign In"}</button>
      </form>
      <p className="auth-foot">Need a business account? <Link href="/advertise/signup">Create one</Link></p>
      <p className="auth-foot">Resident? <Link href="/login">Resident Sign In</Link></p>
    </section></main>
  );
}
