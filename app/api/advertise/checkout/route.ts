import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripePost } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { bidAmount } = await request.json();
    const amount = Math.floor(Number(bidAmount));
    if (!Number.isFinite(amount) || amount < 10 || amount > 10000) {
      return NextResponse.json({ error: "Enter a monthly visibility bid between $10 and $10,000." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id,name,contact_email,business_email,review_status")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (businessError || !business) return NextResponse.json({ error: "Complete your business profile first." }, { status: 400 });
    if (business.review_status === "draft") return NextResponse.json({ error: "Complete and submit your business information before bidding." }, { status: 400 });

    const { data: existingActive } = await supabase
      .from("business_plan_subscriptions")
      .select("id,stripe_subscription_id,status")
      .eq("business_id", business.id)
      .in("status", ["pending", "active", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingActive?.stripe_subscription_id) {
      return NextResponse.json({ error: "You already have an active leaderboard subscription. Manage or cancel it from your dashboard before starting a new bid." }, { status: 409 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const body = new URLSearchParams();
    body.set("mode", "subscription");
    body.set("line_items[0][price_data][currency]", "usd");
    body.set("line_items[0][price_data][unit_amount]", String(amount * 100));
    body.set("line_items[0][price_data][recurring][interval]", "month");
    body.set("line_items[0][price_data][product_data][name]", `JRT Sponsored Leaderboard — ${business.name}`);
    body.set("line_items[0][quantity]", "1");
    body.set("success_url", `${siteUrl}/advertise/dashboard?payment=success`);
    body.set("cancel_url", `${siteUrl}/advertise/plans?payment=canceled`);
    body.set("client_reference_id", business.id);
    body.set("metadata[business_id]", business.id);
    body.set("metadata[bid_amount]", String(amount));
    body.set("metadata[plan_code]", "listed");
    body.set("subscription_data[metadata][business_id]", business.id);
    body.set("subscription_data[metadata][bid_amount]", String(amount));
    body.set("subscription_data[metadata][plan_code]", "listed");
    const customerEmail = business.business_email || business.contact_email || user.email;
    if (customerEmail) body.set("customer_email", customerEmail);

    const session = await stripePost("/checkout/sessions", body);

    if (existingActive) {
      await supabase.from("business_plan_subscriptions").update({
        plan_code: "listed",
        status: "pending",
        payment_status: "processing",
        stripe_checkout_session_id: session.id,
        stripe_price_id: null,
        updated_at: new Date().toISOString(),
      }).eq("id", existingActive.id);
    } else {
      await supabase.from("business_plan_subscriptions").insert({
        business_id: business.id,
        plan_code: "listed",
        status: "pending",
        payment_status: "processing",
        stripe_checkout_session_id: session.id,
        stripe_price_id: null,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start payment." }, { status: 500 });
  }
}
