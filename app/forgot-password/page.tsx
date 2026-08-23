"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();
      const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
      const siteUrl = configured || window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${siteUrl}/update-password` },
      );
      if (resetError) throw resetError;
      setMessage("If an account exists for that email, a password reset link has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send password reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/login" className="auth-brand">Jordan Ranch & Tamarron Residents</Link>
        <span className="badge">Account Recovery</span>
        <h1>Reset your password</h1>
        <p className="auth-copy">Enter the email address connected to your resident account.</p>
        <form onSubmit={submit} className="form-stack">
          <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}
          <button className="btn-primary" disabled={loading}>{loading ? "Sending…" : "Send Reset Link"}</button>
        </form>
        <p className="auth-foot"><Link href="/login">Back to sign in</Link></p>
      </section>
    </main>
  );
}
