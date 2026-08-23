import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripePost, stripePriceEnv } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { planCode } = await request.json();
    if (!planCode || !stripePriceEnv[planCode]) {
      return NextResponse.json({ error: "This advertising plan is not configured for payment yet." }, { status: 400 });
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
    if (business.review_status === "draft") return NextResponse.json({ error: "Complete and submit your business information before payment." }, { status: 400 });

    const { data: plan } = await supabase.from("advertising_plans").select("code,name,price_monthly").eq("code", planCode).eq("active", true).maybeSingle();
    if (!plan) return NextResponse.json({ error: "Advertising plan not found." }, { status: 404 });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const body = new URLSearchParams();
    body.set("mode", "subscription");
    body.set("line_items[0][price]", stripePriceEnv[planCode]!);
    body.set("line_items[0][quantity]", "1");
    body.set("success_url", `${siteUrl}/advertise/dashboard?payment=success`);
    body.set("cancel_url", `${siteUrl}/advertise/plans?payment=canceled`);
    body.set("client_reference_id", business.id);
    body.set("metadata[business_id]", business.id);
    body.set("metadata[plan_code]", planCode);
    body.set("subscription_data[metadata][business_id]", business.id);
    body.set("subscription_data[metadata][plan_code]", planCode);
    body.set("allow_promotion_codes", "true");
    const customerEmail = business.business_email || business.contact_email || user.email;
    if (customerEmail) body.set("customer_email", customerEmail);

    const session = await stripePost("/checkout/sessions", body);

    const { data: existing } = await supabase
      .from("business_plan_subscriptions")
      .select("id")
      .eq("business_id", business.id)
      .in("status", ["pending", "active"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabase.from("business_plan_subscriptions").update({
        plan_code: planCode,
        status: "pending",
        payment_status: "processing",
        stripe_checkout_session_id: session.id,
        stripe_price_id: stripePriceEnv[planCode],
        updated_at: new Date().toISOString(),
      }).eq("id", existing.id);
    } else {
      await supabase.from("business_plan_subscriptions").insert({
        business_id: business.id,
        plan_code: planCode,
        status: "pending",
        payment_status: "processing",
        stripe_checkout_session_id: session.id,
        stripe_price_id: stripePriceEnv[planCode],
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start payment." }, { status: 500 });
  }
}
