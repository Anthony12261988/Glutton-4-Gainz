import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripe } from "./stripe-client";

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error("No userId in session metadata");
    return;
  }

  // Get customer ID from session
  const customerId = session.customer as string;

  // Update user role to soldier AND store Stripe customer ID
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      role: "soldier",
      stripe_customer_id: customerId
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user role:", error);
    throw error;
  }

  console.log(`User ${userId} upgraded to soldier (customer: ${customerId})`);
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID (more reliable than email)
  const { data: profile, error: fetchError } = await supabaseAdmin
    .from("profiles")
    .select("id, email")
    .eq("stripe_customer_id", customerId)
    .single();

  if (fetchError || !profile) {
    console.error("No profile found for customer ID:", customerId);
    return;
  }

  // Downgrade user role to user
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role: "user" })
    .eq("id", profile.id);

  if (error) {
    console.error("Error downgrading user role:", error);
    throw error;
  }

  console.log(`User ${profile.email} (${profile.id}) downgraded to user`);
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const { data: profile, error: fetchError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, role")
    .eq("stripe_customer_id", customerId)
    .single();

  if (fetchError || !profile) {
    console.error("No profile found for customer ID:", customerId);
    return;
  }

  // Update role based on subscription status
  let newRole = profile.role; // Keep existing role by default

  if (subscription.status === 'active' || subscription.status === 'trialing') {
    // Active subscription = soldier tier
    newRole = 'soldier';
  } else if (
    subscription.status === 'canceled' ||
    subscription.status === 'unpaid' ||
    subscription.status === 'past_due'
  ) {
    // Inactive subscription = downgrade to user
    newRole = 'user';
  }

  // Only update if role changed
  if (newRole !== profile.role) {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role: newRole })
      .eq("id", profile.id);

    if (error) {
      console.error("Error updating user role:", error);
      throw error;
    }

    console.log(
      `User ${profile.email} (${profile.id}) role updated: ${profile.role} → ${newRole} (subscription status: ${subscription.status})`
    );
  } else {
    console.log(
      `User ${profile.email} (${profile.id}) subscription updated, role unchanged (status: ${subscription.status})`
    );
  }
}

export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
) {
  const customerId = invoice.customer as string;

  // Find user by Stripe customer ID
  const { data: profile, error: fetchError } = await supabaseAdmin
    .from("profiles")
    .select("id, email")
    .eq("stripe_customer_id", customerId)
    .single();

  if (fetchError || !profile) {
    console.error("No profile found for customer ID:", customerId);
    return;
  }

  // Log payment failure
  console.error(
    `Payment failed for user ${profile.email} (${profile.id}). Invoice: ${invoice.id}, Amount: $${(invoice.amount_due / 100).toFixed(2)}`
  );

  // Create in-app notification for failed payment
  try {
    const { error: notifError } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: profile.id,
        type: "payment_failed",
        title: "PAYMENT FAILED",
        message: `Your payment of $${(invoice.amount_due / 100).toFixed(2)} failed. Please update your payment method to maintain access.`,
        action_url: "/pricing",
        priority: "high",
      });

    if (notifError) {
      console.error("Failed to create notification:", notifError);
    } else {
      console.log(`Payment failure notification created for user ${profile.email}`);
    }
  } catch (error) {
    console.error("Error creating payment notification:", error);
  }

  // Note: Stripe handles automatic retry logic
  // After final retry fails, subscription will be canceled and
  // handleSubscriptionDeleted will downgrade the user automatically
}
