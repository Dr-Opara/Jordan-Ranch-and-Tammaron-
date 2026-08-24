import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "jrt.community";
const residentProtected = new Set(["/"]);
const authProtectedPrefixes = [
  "/verify-residency",
  "/marketplace",
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

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";

  // Keep every production-facing request on the permanent JRT.community host.
  // Vercel deployment URLs remain available internally, but users should never
  // stay on a *.vercel.app URL in production.
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

  if (needsAuth && !user) {
    const login = request.nextUrl.clone();
    login.pathname = pathname.startsWith("/advertise/") ? "/advertise/signup" : "/login";
    login.search = "";
    return NextResponse.redirect(login);
  }

  if (pathname === "/" && user?.user_metadata?.account_type === "advertiser") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/advertise/dashboard";
    destination.search = "";
    return NextResponse.redirect(destination);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
