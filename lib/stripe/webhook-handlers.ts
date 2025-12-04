import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { stripe } from './stripe-client';

export async function handleCheckoutSessionCompleted(session: Stripe.CheckoutSession) {
  const userId = session.metadata?.userId;
  
  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Update user role to soldier
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role: 'soldier' })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    throw error;
  }

  console.log(`User ${userId} upgraded to soldier`);
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Fetch customer to get email
  const customer = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted) {
    console.error('Customer deleted, cannot retrieve email');
    return;
  }

  const email = (customer as Stripe.Customer).email;

  if (!email) {
    console.error('No email found for customer');
    return;
  }

  // Downgrade user role to user
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role: 'user' })
    .eq('email', email);

  if (error) {
    console.error('Error downgrading user role:', error);
    throw error;
  }

  console.log(`User ${email} downgraded to user`);
}
