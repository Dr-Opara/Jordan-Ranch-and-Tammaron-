import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CURRENT = { resident: "resident_v1.0", advertiser: "business_v1.0" } as const;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const accountType = body?.account_type === "advertiser" ? "advertiser" : "resident";
  const bundleVersion = CURRENT[accountType];
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = request.headers.get("user-agent") || null;

  const { error } = await supabase.from("policy_acceptances").upsert({
    user_id: user.id,
    account_type: accountType,
    bundle_version: bundleVersion,
    ip_address: forwarded,
    user_agent: userAgent,
    acceptance_source: "required_gate",
  }, { onConflict: "user_id,bundle_version", ignoreDuplicates: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, bundle_version: bundleVersion });
}
