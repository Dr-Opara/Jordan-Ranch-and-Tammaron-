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

      const accountType = result.data.user.user_metadata?.account_type;
      if (accountType === "advertiser") {
        window.location.assign("/advertise/dashboard");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("verification_status")
        .eq("id", result.data.user.id)
        .maybeSingle();

      if (profile?.verification_status === "verified") {
        window.location.assign("/");
      } else {
        window.location.assign("/verify-residency");
      }
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
          {error && <div className="form-error">{error}</div>}
          <button className="btn-primary" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</button>
        </form>
        <p className="auth-foot">New resident? <Link href="/signup">Create an account</Link></p>
      </section>
    </main>
  );
}
