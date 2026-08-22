import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  if (pathname === "/" && user) {
    if (user.user_metadata?.account_type === "advertiser") {
      const destination = request.nextUrl.clone();
      destination.pathname = "/advertise/dashboard";
      destination.search = "";
      return NextResponse.redirect(destination);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("verification_status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.verification_status !== "verified") {
      const verify = request.nextUrl.clone();
      verify.pathname = "/verify-residency";
      verify.search = "";
      return NextResponse.redirect(verify);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
