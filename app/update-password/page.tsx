"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setError("This password reset link is invalid or has expired. Request a new one.");
    });
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await supabase.auth.signOut();
      setMessage("Password updated successfully. You can now sign in with your new password.");
      setReady(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/login" className="auth-brand">Jordan Ranch & Tamarron Residents</Link>
        <span className="badge">Account Recovery</span>
        <h1>Choose a new password</h1>
        <p className="auth-copy">Create a new password for your resident account.</p>
        {error && <div className="form-error">{error}</div>}
        {message && <div className="form-success">{message}</div>}
        {ready && (
          <form onSubmit={submit} className="form-stack">
            <label>New password<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></label>
            <label>Confirm new password<input type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" /></label>
            <button className="btn-primary" disabled={loading}>{loading ? "Updating…" : "Update Password"}</button>
          </form>
        )}
        <p className="auth-foot"><Link href="/login">Return to sign in</Link></p>
      </section>
    </main>
  );
}
