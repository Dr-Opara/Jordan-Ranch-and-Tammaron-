"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function normalizeUsPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return value.trim();
}

export default function VerifyPhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [accountType, setAccountType] = useState("resident");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) {
        router.replace("/login");
        return;
      }
      const type = String(user.user_metadata?.account_type ?? "resident");
      setAccountType(type);
      if (user.phone_confirmed_at) {
        router.replace(type === "advertiser" ? "/advertise/setup" : "/verify-residency");
        return;
      }
      const savedPhone = String(user.user_metadata?.phone ?? user.phone ?? "");
      setPhone(savedPhone);
    });
  }, [router]);

  async function sendCode() {
    setError("");
    setMessage("");
    const cleanPhone = normalizeUsPhone(phone);
    if (!/^\+1\d{10}$/.test(cleanPhone)) {
      setError("Enter a valid U.S. mobile number with area code.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      phone: cleanPhone,
      data: { phone: cleanPhone },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setPhone(cleanPhone);
    setSent(true);
    setMessage("A 6-digit verification code was sent to your mobile phone.");
    setLoading(false);
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const cleanPhone = normalizeUsPhone(phone);
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      phone: cleanPhone,
      token: code.trim(),
      type: "phone_change",
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setMessage("Phone verified successfully. Opening your next step…");
    router.replace(accountType === "advertiser" ? "/advertise/setup" : "/verify-residency");
    router.refresh();
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="auth-brand">Jordan Ranch & Tamarron Residents</Link>
        <span className="badge">SMS Verification</span>
        <h1>Verify your mobile number</h1>
        <p className="auth-copy">We use SMS verification to reduce fake accounts and protect the community. Your phone number is private and is never shown publicly.</p>

        <div className="form-stack">
          <label>Mobile phone
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(281) 555-0123" autoComplete="tel" />
          </label>
          <button type="button" className="btn-secondary" disabled={loading} onClick={sendCode}>{loading && !sent ? "Sending code…" : sent ? "Resend Code" : "Send Verification Code"}</button>

          {sent && (
            <form onSubmit={verifyCode} className="form-stack">
              <label>6-digit verification code
                <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" />
              </label>
              <button className="btn-primary" disabled={loading}>{loading ? "Verifying…" : "Verify Phone"}</button>
            </form>
          )}

          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}
        </div>
      </section>
    </main>
  );
}
