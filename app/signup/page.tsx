"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Community = "jordan_ranch" | "tamarron";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [community, setCommunity] = useState<Community>("jordan_ranch");
  const [profession, setProfession] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    if (!cleanFirst || !cleanLast) {
      setError("Enter your full first and last name.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const origin = window.location.origin;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          first_name: cleanFirst,
          last_name: cleanLast,
          last_initial: cleanLast.slice(0, 1).toUpperCase(),
          community,
          profession: profession.trim() || null,
          business_name: businessName.trim() || null,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/verify-residency");
      return;
    }

    setMessage("Check your email to confirm your account. After confirmation, you’ll continue to residency verification.");
    setLoading(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <Link href="/" className="auth-brand">Jordan Ranch & Tamarron Residents</Link>
        <span className="badge">Resident Registration</span>
        <h1>Join your community</h1>
        <p className="auth-copy">Enter your full legal name for private residency verification. After approval, other residents will only see your first name and last initial.</p>
        <form onSubmit={submit} className="form-stack">
          <div className="form-grid two">
            <label>First name<input required value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={60} autoComplete="given-name" /></label>
            <label>Last name<input required value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={80} autoComplete="family-name" /></label>
          </div>
          <label>Community<select value={community} onChange={(e) => setCommunity(e.target.value as Community)}><option value="jordan_ranch">Jordan Ranch</option><option value="tamarron">Tamarron</option></select></label>
          <div className="form-grid two">
            <label>Profession <span className="optional">optional</span><input value={profession} onChange={(e) => setProfession(e.target.value)} maxLength={80} /></label>
            <label>Business <span className="optional">optional</span><input value={businessName} onChange={(e) => setBusinessName(e.target.value)} maxLength={100} /></label>
          </div>
          <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          <label>Password<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></label>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}
          <button className="btn-primary" disabled={loading}>{loading ? "Creating account…" : "Create Resident Account"}</button>
        </form>
        <p className="auth-foot">Already joined? <Link href="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
