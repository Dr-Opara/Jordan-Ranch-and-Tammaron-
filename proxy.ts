import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "jrt.community";
const residentProtected = new Set(["/"]);
const authProtectedPrefixes = [
  "/policy-agreement",
  "/verify-residency",
  "/marketplace",
  "/community",
  "/business",
  "/resident",
  "/profile",
  "/events",
  "/coming-soon",
  "/advertise/setup",
  "/advertise/dashboard",
  "/advertise/campaign",
  "/advertise/deal",
  "/advertise/plans",
  "/advertise/profile",
  "/admin",
];
const advertiserProtectedPrefixes = [
  "/advertise/setup",
  "/advertise/dashboard",
  "/advertise/campaign",
  "/advertise/deal",
  "/advertise/plans",
  "/advertise/profile",
];
const residentOnlyPrefixes = [
  "/verify-residency",
  "/marketplace",
  "/community",
  "/resident",
  "/profile",
  "/events",
  "/coming-soon",
];

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";

  if (hostname.includes("jordan-ranch-tamarron") && hostname.endsWith(".vercel.app")) {
    const canonical = request.nextUrl.clone();
    canonical.protocol = "https:";
    canonical.host = CANONICAL_HOST;
    return NextResponse.redirect(canonical, 308);
  }

  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const needsAuth = residentProtected.has(pathname) || authProtectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isAdvertiserRoute = advertiserProtectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isResidentOnlyRoute = residentOnlyPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (needsAuth && !user) {
    const login = request.nextUrl.clone();
    login.pathname = isAdvertiserRoute ? "/advertise/login" : "/login";
    login.search = "";
    return NextResponse.redirect(login);
  }

  if (user) {
    const accountType = user.user_metadata?.account_type === "advertiser" ? "advertiser" : "resident";

    // Keep the resident and advertiser experiences strictly separated.
    if (isAdvertiserRoute && accountType !== "advertiser") {
      const destination = request.nextUrl.clone();
      destination.pathname = "/";
      destination.search = "";
      return NextResponse.redirect(destination);
    }
    if ((isResidentOnlyRoute || pathname === "/") && accountType === "advertiser") {
      const destination = request.nextUrl.clone();
      destination.pathname = "/advertise/dashboard";
      destination.search = "";
      return NextResponse.redirect(destination);
    }

    if (needsAuth && pathname !== "/policy-agreement") {
      const currentBundle = accountType === "advertiser" ? "business_v1.0" : "resident_v1.0";
      const { data: acceptance } = await supabase
        .from("policy_acceptances")
        .select("id")
        .eq("user_id", user.id)
        .eq("bundle_version", currentBundle)
        .maybeSingle();

      if (!acceptance) {
        const agreement = request.nextUrl.clone();
        agreement.pathname = "/policy-agreement";
        agreement.search = `?account_type=${accountType}`;
        return NextResponse.redirect(agreement);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
