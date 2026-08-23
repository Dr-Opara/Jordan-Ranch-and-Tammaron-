import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function verifyStripeSignature(rawBody: string, signature: string, secret: string) {
  const parts = signature.split(",").map((part) => part.split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || signatures.length === 0) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return signatures.some((candidate) => {
    try {
      const a = Buffer.from(expected, "hex");
      const b = Buffer.from(candidate, "hex");
      return a.length === b.length && timingSafeEqual(a, b);
    } catch { return false; }
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") || "";
  if (!verifyStripeSignature(rawBody, signature, webhookSecret)) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const event = JSON.parse(rawBody);
  const admin = createAdminClient();

  try {
    const object = event.data?.object || {};
    const businessId = object.metadata?.business_id || object.subscription_details?.metadata?.business_id || null;
    const planCode = object.metadata?.plan_code || object.subscription_details?.metadata?.plan_code || null;

    if (event.type === "checkout.session.completed") {
      const session = object;
      const { data: sub } = await admin.from("business_plan_subscriptions").select("id").eq("stripe_checkout_session_id", session.id).maybeSingle();
      if (sub) {
        await admin.from("business_plan_subscriptions").update({
          status: session.payment_status === "paid" || session.payment_status === "no_payment_required" ? "active" : "pending",
          payment_status: session.payment_status === "paid" || session.payment_status === "no_payment_required" ? "paid" : "processing",
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
          starts_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", sub.id);
      }
      if (businessId) {
        await admin.from("businesses").update({ review_status: "submitted", submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", businessId);
      }
    }

    if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
      const status = event.type === "invoice.paid" ? "paid" : "failed";
      const subscriptionId = typeof object.subscription === "string" ? object.subscription : object.parent?.subscription_details?.subscription;
      if (subscriptionId) {
        await admin.from("business_plan_subscriptions").update({
          status: event.type === "invoice.paid" ? "active" : "past_due",
          payment_status: status,
          updated_at: new Date().toISOString(),
        }).eq("stripe_subscription_id", subscriptionId);
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const s = object;
      const nextStatus = event.type === "customer.subscription.deleted" || s.status === "canceled" ? "canceled" : s.status === "past_due" || s.status === "unpaid" ? "past_due" : "active";
      await admin.from("business_plan_subscriptions").update({
        status: nextStatus,
        cancel_at_period_end: Boolean(s.cancel_at_period_end),
        current_period_end: s.current_period_end ? new Date(s.current_period_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq("stripe_subscription_id", s.id);
    }

    await admin.from("business_billing_events").upsert({
      stripe_event_id: event.id,
      business_id: businessId,
      event_type: event.type,
      amount_cents: object.amount_paid ?? object.amount_total ?? null,
      currency: object.currency ?? "usd",
      payment_status: object.payment_status ?? object.status ?? null,
      raw_reference: object.id ?? null,
    }, { onConflict: "stripe_event_id", ignoreDuplicates: true });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("stripe webhook error", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
