const STRIPE_API = "https://api.stripe.com/v1";

function secret() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return key;
}

export const stripePriceEnv: Record<string, string | undefined> = {
  listed: process.env.STRIPE_PRICE_GET_LISTED,
  noticed: process.env.STRIPE_PRICE_GET_NOTICED,
  featured: process.env.STRIPE_PRICE_GET_FEATURED,
  everywhere: process.env.STRIPE_PRICE_GET_EVERYWHERE,
};

export async function stripePost(path: string, body: URLSearchParams) {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json?.error?.message || "Stripe request failed");
  return json;
}
