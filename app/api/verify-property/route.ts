import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const FBCAD_QUERY_URL = "https://gisweb.fbcad.org/arcgis/rest/services/Hosted/FBCAD_Public_Data/FeatureServer/0/query";

type Community = "jordan_ranch" | "tamarron";

type Parcel = {
  quickrefid?: string | null;
  ownername?: string | null;
  situs?: string | null;
  legal?: string | null;
};

function normalize(value: string) {
  return value
    .toUpperCase()
    .replace(/\bSTREET\b/g, "ST")
    .replace(/\bROAD\b/g, "RD")
    .replace(/\bDRIVE\b/g, "DR")
    .replace(/\bLANE\b/g, "LN")
    .replace(/\bCOURT\b/g, "CT")
    .replace(/\bBOULEVARD\b/g, "BLVD")
    .replace(/\bAVENUE\b/g, "AVE")
    .replace(/\bPARKWAY\b/g, "PKWY")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sqlSafe(value: string) {
  return value.replace(/'/g, "''");
}

function nameMatches(ownerName: string, firstName: string, lastName: string) {
  const owner = normalize(ownerName);
  const first = normalize(firstName);
  const last = normalize(lastName);
  if (!owner || !first || !last) return false;
  const lastOk = owner.includes(last);
  const firstOk = owner.includes(first) || owner.includes(`${first.charAt(0)} `) || owner.endsWith(` ${first.charAt(0)}`);
  return lastOk && firstOk;
}

function communityMatches(legal: string | null | undefined, community: Community) {
  const text = normalize(legal ?? "");
  return community === "jordan_ranch" ? text.includes("JORDAN RANCH") : text.includes("TAMARRON");
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { address?: string; community?: Community } | null;
  const address = normalize(body?.address ?? "");
  const community = body?.community;
  if (!address || !community || !["jordan_ranch", "tamarron"].includes(community)) {
    return NextResponse.json({ error: "Address and community are required." }, { status: 400 });
  }

  const metadata = user.user_metadata ?? {};
  const firstName = String(metadata.first_name ?? "").trim();
  const lastName = String(metadata.last_name ?? "").trim();
  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Your account is missing a full legal name. Please update registration first." }, { status: 400 });
  }

  const tokens = address.split(" ").filter(Boolean);
  const streetNumber = tokens.find((t) => /^\d+[A-Z]?$/.test(t)) ?? "";
  const streetWords = tokens.filter((t) => !/^\d+[A-Z]?$/.test(t));
  const usefulStreetWords = streetWords.filter((t) => !["KATY", "FULSHEAR", "RICHMOND", "TX", "TEXAS"].includes(t) && !/^77\d{3}$/.test(t));
  const streetNeedle = usefulStreetWords.slice(0, 3).join(" ");

  const whereParts: string[] = [];
  if (streetNumber) whereParts.push(`situs LIKE '%${sqlSafe(streetNumber)}%'`);
  if (streetNeedle) whereParts.push(`UPPER(situs) LIKE '%${sqlSafe(streetNeedle)}%'`);
  const where = whereParts.length ? whereParts.join(" AND ") : `UPPER(situs) LIKE '%${sqlSafe(address)}%'`;

  const params = new URLSearchParams({
    f: "json",
    where,
    outFields: "quickrefid,ownername,situs,legal",
    returnGeometry: "false",
    resultRecordCount: "25",
  });

  const response = await fetch(`${FBCAD_QUERY_URL}?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) {
    return NextResponse.json({ error: "Fort Bend public property data is temporarily unavailable." }, { status: 502 });
  }

  const payload = await response.json() as { features?: Array<{ attributes?: Parcel }>; error?: { message?: string } };
  if (payload.error) {
    return NextResponse.json({ error: "Fort Bend public property data could not be searched right now." }, { status: 502 });
  }

  const parcels = (payload.features ?? []).map((feature) => feature.attributes ?? {});
  const exactAddress = parcels.find((parcel) => {
    const situs = normalize(parcel.situs ?? "");
    const addressNoCity = normalize(address.split(",")[0] ?? address);
    return situs.includes(addressNoCity) || addressNoCity.includes(situs.split(",")[0] ?? situs);
  }) ?? parcels[0];

  if (!exactAddress) {
    return NextResponse.json({
      matched: false,
      autoApproved: false,
      status: "no_property_match",
      message: "We could not match that address in Fort Bend CAD public parcel data. You can still submit proof of residency for manual review.",
    });
  }

  const ownerName = String(exactAddress.ownername ?? "");
  const situs = String(exactAddress.situs ?? "");
  const legal = String(exactAddress.legal ?? "");
  const ownerMatched = nameMatches(ownerName, firstName, lastName);
  const communityMatched = communityMatches(legal, community);
  const confidence = 60 + (communityMatched ? 20 : 0) + (ownerMatched ? 20 : 0);
  const strongMatch = ownerMatched && communityMatched;

  let autoApproved = false;
  if (strongMatch) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (serviceRoleKey && supabaseUrl) {
      const admin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const now = new Date().toISOString();

      const { error: verificationError } = await admin.from("resident_verifications").upsert({
        user_id: user.id,
        community,
        resident_type: "property_owner",
        residential_address: body?.address?.trim() ?? address,
        evidence_path: null,
        legal_first_name: firstName,
        legal_last_name: lastName,
        verification_method: "fbcad_match",
        property_match_status: "strong_match",
        property_match_confidence: confidence,
        fbcad_quickrefid: exactAddress.quickrefid ?? null,
        matched_owner_name: ownerName,
        matched_situs: situs,
        matched_legal: legal,
        public_record_checked_at: now,
        status: "verified",
        reviewed_at: now,
      }, { onConflict: "user_id" });

      if (!verificationError) {
        const { error: profileError } = await admin.from("profiles").update({
          community,
          verification_status: "verified",
          updated_at: now,
        }).eq("id", user.id);
        autoApproved = !profileError;
      }
    }
  }

  return NextResponse.json({
    matched: strongMatch,
    autoApproved,
    status: strongMatch ? "strong_match" : ownerMatched ? "name_match_only" : communityMatched ? "address_community_match" : "address_match_only",
    confidence,
    quickRefId: exactAddress.quickrefid ?? null,
    situs,
    legal,
    ownerName,
    ownerMatched,
    communityMatched,
    message: strongMatch
      ? (autoApproved
          ? "Public property data matched your address, community and name. You are verified and can continue into the app."
          : "Public property data matched your address, community and name, but automatic approval is not configured yet.")
      : "We found the property, but the public ownership record did not fully match. This is common for renters, spouses, trusts, recent buyers or owners who opted out of online display. You can submit proof of residency for review.",
  });
}
