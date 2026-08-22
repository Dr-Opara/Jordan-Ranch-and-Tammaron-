"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Community = "jordan_ranch" | "tamarron";

export default function VerifyResidencyPage() {
  const router = useRouter();
  const [community, setCommunity] = useState<Community>("jordan_ranch");
  const [address, setAddress] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/login");
      const savedCommunity = data.user?.user_metadata?.community as Community | undefined;
      if (savedCommunity) setCommunity(savedCommunity);
    });
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) {
      router.replace("/login");
      return;
    }

    let evidencePath: string | null = null;
    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      evidencePath = `${user.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("verification-evidence")
        .upload(evidencePath, file, { upsert: false });
      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }
    }

    const { error: verificationError } = await supabase.from("resident_verifications").upsert(
      {
        user_id: user.id,
        community,
        residential_address: address.trim(),
        evidence_path: evidencePath,
        status: "pending",
      },
      { onConflict: "user_id" },
    );

    if (verificationError) {
      setError(verificationError.message);
      setLoading(false);
      return;
    }

    await supabase.from("profiles").update({ community }).eq("id", user.id);
    setMessage("Verification submitted. Your address and proof are private and are never displayed to other residents.");
    setLoading(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <Link href="/" className="auth-brand">Jordan Ranch & Tamarron</Link>
        <span className="badge">Private Residency Verification</span>
        <h1>Verify that you live here</h1>
        <p className="auth-copy">Your address is used only to verify residency. Other residents, businesses and advertisers cannot see it.</p>
        <form onSubmit={submit} className="form-stack">
          <label>Community<select value={community} onChange={(e) => setCommunity(e.target.value as Community)}><option value="jordan_ranch">Jordan Ranch</option><option value="tamarron">Tamarron</option></select></label>
          <label>Residential address<input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" autoComplete="street-address" /></label>
          <label>Proof of residency <span className="optional">optional during beta</span><input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
          <div className="private-note"><strong>Privacy:</strong> Verification documents are stored in a private bucket. They do not appear on your resident profile.</div>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}
          <button className="btn-primary" disabled={loading}>{loading ? "Submitting…" : "Submit for Verification"}</button>
        </form>
        {message && <Link href="/" className="auth-foot">Return to Home →</Link>}
      </section>
    </main>
  );
}
