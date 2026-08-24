import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null, accountType: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return accountType === "advertiser" ? "/advertise/setup" : "/verify-residency";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const accountType = url.searchParams.get("account_type");
  const next = safeNext(url.searchParams.get("next"), accountType);

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      const redirectUrl = new URL(next, url.origin);
      redirectUrl.searchParams.set("confirmed", "1");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(new URL(`/login?error=confirmation_failed`, url.origin));
}
