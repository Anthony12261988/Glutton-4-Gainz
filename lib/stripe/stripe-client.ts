import Stripe from "stripe";

export function getStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }

  return new Stripe(stripeKey, {
    apiVersion: "2025-11-17.clover",
    typescript: true,
  });
}
