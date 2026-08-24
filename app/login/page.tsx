"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verification") === "submitted") {
      setNotice("Your residency verification was submitted successfully. Sign in again after approval to access the resident app.");
    }
    if (params.get("error") === "confirmation_failed") {
      setError("We could not confirm that email link. Please request a new confirmation or try signing in again.");
    }
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Sign in timed out. Please try again.")), 15000),
      );

      const result = await Promise.race([
        supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        }),
        timeout,
      ]);

      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (!result.data.session || !result.data.user) {
        setError("We could not create a sign-in session. Please try again.");
        return;
      }

      if (result.data.user.user_metadata?.account_type === "advertiser") {
        window.location.replace("/advertise/dashboard");
        return;
      }

      // The root page performs the single authoritative residency check using
      // server-side state. Do not duplicate that decision in the browser.
      window.location.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="auth-brand">Jordan Ranch & Tamarron Residents</Link>
        <span className="badge">Residents Only</span>
        <h1>Welcome back</h1>
        <p className="auth-copy">Sign in to your verified neighborhood account.</p>
        {notice && <div className="form-success">{notice}</div>}
        <form onSubmit={submit} className="form-stack">
          <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
          <div className="auth-foot" style={{ marginTop: -4 }}><Link href="/forgot-password">Forgot password?</Link></div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn-primary" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</button>
        </form>
        <p className="auth-foot">New resident? <Link href="/signup">Create an account</Link></p>
      </section>
    </main>
  );
}
