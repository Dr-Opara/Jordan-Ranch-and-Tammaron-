"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Community = "jordan_ranch" | "tamarron";
type ResidentType = "property_owner" | "renter_non_owner";
type MatchResult = {
  matched: boolean;
  autoApproved?: boolean;
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
  const [residentType, setResidentType] = useState<ResidentType>("property_owner");
  const [address, setAddress] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [legalFirstName, setLegalFirstName] = useState("");
  const [legalLastName, setLegalLastName] = useState("");
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);

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

      const [{ data: existingProfile }, { data: existingVerification }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, verification_status")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("resident_verifications")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (existingProfile?.verification_status === "verified" || existingVerification?.status === "verified") {
        router.replace("/");
        router.refresh();
        return;
      }

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
      setError("Enter your full residential address first.");
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
      if (result.autoApproved) {
        setMessage("Verified. Your property ownership, address and community matched Fort Bend CAD records. You now have resident access.");
      }
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

    if (residentType === "property_owner" && match?.autoApproved) {
      window.location.assign("/");
      return;
    }

    setMessage("");

    if (residentType === "property_owner" && !match) {
      setError("Property owners must check the address against Fort Bend CAD before submitting.");
      setLoading(false);
      return;
    }
    if (residentType === "renter_non_owner" && !file) {
      setError("Renters and non-owner residents must upload a current proof of address.");
      setLoading(false);
      return;
    }

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

    const method = residentType === "property_owner"
      ? "manual_owner_review"
      : "renter_document";

    const { error: verificationError } = await supabase.from("resident_verifications").upsert(
      {
        user_id: user.id,
        community,
        resident_type: residentType,
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

    if (residentType === "property_owner") {
      setMessage("The property record did not fully satisfy automatic verification, so your submission will be reviewed.");
    } else {
      setMessage("Renter/non-owner verification submitted. Your proof of address is private and will be used only for residency verification.");
    }
    setLoading(false);
  }

  async function continueAfterSubmission() {
    setContinuing(true);
    setError("");
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      router.replace("/login?verification=submitted");
      return;
    }

    const [{ data: profile }, { data: verification }] = await Promise.all([
      supabase
        .from("profiles")
        .select("verification_status")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("resident_verifications")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (profile?.verification_status === "verified" || verification?.status === "verified" || match?.autoApproved) {
      window.location.assign("/");
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login?verification=submitted");
    router.refresh();
  }

  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <Link href="/" className="auth-brand">Jordan Ranch & Tamarron Residents</Link>
        <span className="badge">Private Residency Verification</span>
        <h1>Verify that you live here</h1>
        <p className="auth-copy">Choose the option that describes your residency. Your full name, address and verification records are private and never appear on your resident profile.</p>

        <form onSubmit={submit} className="form-stack">
          <label>Community
            <select value={community} onChange={(e) => { setCommunity(e.target.value as Community); setMatch(null); setMessage(""); }}>
              <option value="jordan_ranch">Jordan Ranch</option>
              <option value="tamarron">Tamarron</option>
            </select>
          </label>

          <label>Residency type
            <select value={residentType} onChange={(e) => { setResidentType(e.target.value as ResidentType); setMatch(null); setFile(null); setError(""); setMessage(""); }}>
              <option value="property_owner">Property Owner</option>
              <option value="renter_non_owner">Resident Renter / Non-owner</option>
            </select>
          </label>

          <label>Full residential address
            <input required value={address} onChange={(e) => { setAddress(e.target.value); setMatch(null); setMessage(""); }} placeholder="Street address" autoComplete="street-address" />
          </label>

          {residentType === "property_owner" ? (
            <>
              <div className="private-note"><strong>Property Owner:</strong> We will compare your full residential address and private legal name with Fort Bend CAD public property records.</div>
              <button type="button" className="btn-secondary" onClick={checkPublicRecord} disabled={checking || !address.trim()}>{checking ? "Checking Fort Bend records…" : "Check Address with Fort Bend CAD"}</button>
              {match && <div className={match.matched ? "form-success" : "private-note"}>
                <strong>{match.autoApproved ? "Verified resident." : match.matched ? "Public record match found." : "Ownership match needs review."}</strong> {match.message}
              </div>}
            </>
          ) : (
            <>
              <div className="private-note"><strong>Resident Renter / Non-owner:</strong> Enter your full home address and upload one current document that shows that address.</div>
              <label>Proof of address
                <span className="optional"> utility bill, gas/electric bill, internet/Wi-Fi bill, lease, renter&apos;s insurance, or similar current document</span>
                <input required type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </>
          )}

          <div className="private-note"><strong>Privacy:</strong> After verification, other residents see only your first name and last initial. Your full last name, exact address and verification documents remain private.</div>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}

          {!match?.autoApproved && (
            <button className="btn-primary" disabled={loading}>{loading ? "Submitting…" : "Submit for Verification"}</button>
          )}
        </form>

        {(message || match?.autoApproved) && (
          <button type="button" className="btn-primary" onClick={continueAfterSubmission} disabled={continuing} style={{ marginTop: 12, width: "100%" }}>
            {continuing ? "Opening app…" : match?.autoApproved ? "Continue to App" : "Continue"}
          </button>
        )}
      </section>
    </main>
  );
}
