"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Community = "jordan_ranch" | "tamarron";
type MatchResult = {
  matched: boolean;
  status: string;
  confidence?: number;
  quickRefId?: string | null;
  situs?: string;
  legal?: string;
  ownerName?: string;
  ownerMatched?: boolean;
  communityMatched?: boolean;
  message: string;
};

export default function VerifyResidencyPage() {
  const router = useRouter();
  const [community, setCommunity] = useState<Community>("jordan_ranch");
  const [address, setAddress] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [legalFirstName, setLegalFirstName] = useState("");
  const [legalLastName, setLegalLastName] = useState("");
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      const metadata = user.user_metadata ?? {};
      const savedCommunity = metadata.community as Community | undefined;
      if (savedCommunity) setCommunity(savedCommunity);
      const firstName = String(metadata.first_name ?? "Resident").trim() || "Resident";
      const lastName = String(metadata.last_name ?? "").trim();
      const lastInitial = (lastName || String(metadata.last_initial ?? "R")).slice(0, 1).toUpperCase() || "R";
      setLegalFirstName(firstName);
      setLegalLastName(lastName);

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: user.id,
          first_name: firstName,
          last_initial: lastInitial,
          community: savedCommunity ?? "jordan_ranch",
          profession: metadata.profession ?? null,
          business_name: metadata.business_name ?? null,
          verification_status: "pending",
        });
      }
    });
  }, [router]);

  async function checkPublicRecord() {
    if (!address.trim()) {
      setError("Enter your residential address first.");
      return;
    }
    setChecking(true);
    setError("");
    setMessage("");
    setMatch(null);
    try {
      const response = await fetch("/api/verify-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim(), community }),
      });
      const result = await response.json() as MatchResult & { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to check public property data.");
      setMatch(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to check public property data.");
    } finally {
      setChecking(false);
    }
  }

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
        .from("verification-documents")
        .upload(evidencePath, file, { upsert: false });
      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }
    }

    const method = match?.matched ? "fbcad_match" : file ? "document" : "manual";
    const { error: verificationError } = await supabase.from("resident_verifications").upsert(
      {
        user_id: user.id,
        community,
        residential_address: address.trim(),
        evidence_path: evidencePath,
        legal_first_name: legalFirstName || null,
        legal_last_name: legalLastName || null,
        verification_method: method,
        property_match_status: match?.status ?? null,
        property_match_confidence: match?.confidence ?? null,
        fbcad_quickrefid: match?.quickRefId ?? null,
        matched_owner_name: match?.ownerName ?? null,
        matched_situs: match?.situs ?? null,
        matched_legal: match?.legal ?? null,
        public_record_checked_at: match ? new Date().toISOString() : null,
        status: "pending",
      },
      { onConflict: "user_id" },
    );

    if (verificationError) {
      setError(verificationError.message);
      setLoading(false);
      return;
    }

    await supabase.from("profiles").update({ community, verification_status: "pending" }).eq("id", user.id);
    setMessage(match?.matched
      ? "Strong Fort Bend CAD match found and submitted for expedited verification. Your full name, address and public-record match stay private."
      : "Verification submitted. Your full name, address and any proof are private and are never displayed to other residents.");
    setLoading(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <Link href="/" className="auth-brand">Jordan Ranch & Tamarron Residents</Link>
        <span className="badge">Private Residency Verification</span>
        <h1>Verify that you live here</h1>
        <p className="auth-copy">We first check your address and private legal name against Fort Bend County public property data. Other residents, businesses and advertisers never see this information.</p>
        <form onSubmit={submit} className="form-stack">
          <label>Community<select value={community} onChange={(e) => { setCommunity(e.target.value as Community); setMatch(null); }}><option value="jordan_ranch">Jordan Ranch</option><option value="tamarron">Tamarron</option></select></label>
          <label>Residential address<input required value={address} onChange={(e) => { setAddress(e.target.value); setMatch(null); }} placeholder="Street address" autoComplete="street-address" /></label>
          <button type="button" className="btn-secondary" onClick={checkPublicRecord} disabled={checking || !address.trim()}>{checking ? "Checking Fort Bend records…" : "Check Address with Fort Bend CAD"}</button>

          {match && <div className={match.matched ? "form-success" : "private-note"}>
            <strong>{match.matched ? "Public record match found." : "Additional proof may be needed."}</strong> {match.message}
          </div>}

          <label>Proof of residency <span className="optional">only needed if public records do not fully match</span><input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
          <div className="private-note"><strong>Privacy:</strong> Your full last name, address, public-record result and verification documents are private. After verification, your resident profile displays only your first name and last initial.</div>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}
          <button className="btn-primary" disabled={loading}>{loading ? "Submitting…" : "Submit for Verification"}</button>
        </form>
        {message && <Link href="/" className="auth-foot">Return to Home →</Link>}
      </section>
    </main>
  );
}
