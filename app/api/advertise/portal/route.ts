import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripePost } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    if (user.user_metadata?.account_type !== "advertiser") {
      return NextResponse.json({ error: "Business account required." }, { status: 403 });
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!business) return NextResponse.json({ error: "Business profile not found." }, { status: 404 });

    const { data: subscription } = await supabase
      .from("business_plan_subscriptions")
      .select("stripe_customer_id,status")
      .eq("business_id", business.id)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe billing profile is available yet. Complete a subscription first." }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const body = new URLSearchParams();
    body.set("customer", subscription.stripe_customer_id);
    body.set("return_url", `${siteUrl}/advertise/dashboard`);

    const session = await stripePost("/billing_portal/sessions", body);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to open billing portal." }, { status: 500 });
  }
}
