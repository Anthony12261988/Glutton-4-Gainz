import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";

type Buddy = Database["public"]["Tables"]["buddies"]["Row"];

/**
 * Get all buddies for a user (accepted only)
 * @param userId - User UUID
 */
export async function getBuddies(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("buddies")
    .select(`
      *,
      buddy:profiles!buddies_buddy_id_fkey(
        id,
        email,
        avatar_url,
        tier,
        xp,
        current_streak,
        last_active
      )
    `)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching buddies:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get pending buddy requests (incoming)
 * @param userId - User UUID (as buddy_id - these are requests TO this user)
 */
export async function getPendingBuddyRequests(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("buddies")
    .select(`
      *,
      requester:profiles!buddies_user_id_fkey(
        id,
        email,
        avatar_url,
        tier
      )
    `)
    .eq("buddy_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending buddy requests:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get sent buddy requests (outgoing)
 * @param userId - User UUID (as user_id - these are requests FROM this user)
 */
export async function getSentBuddyRequests(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("buddies")
    .select(`
      *,
      buddy:profiles!buddies_buddy_id_fkey(
        id,
        email,
        avatar_url,
        tier
      )
    `)
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sent buddy requests:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Send a buddy request
 * @param userId - Current user UUID
 * @param buddyEmail - Email of user to add as buddy
 */
export async function sendBuddyRequest(userId: string, buddyEmail: string) {
  const supabase = createClient();

  // First, find the user by email
  const { data: buddy, error: findError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", buddyEmail)
    .single();

  if (findError || !buddy) {
    console.error("Error finding user by email:", findError);
    return {
      data: null,
      error: findError || new Error("User not found"),
    };
  }

  // Check if they're trying to add themselves
  if (buddy.id === userId) {
    return {
      data: null,
      error: new Error("Cannot add yourself as a buddy"),
    };
  }

  // Check if request already exists (either direction)
  const { data: existing, error: existingError } = await supabase
    .from("buddies")
    .select("*")
    .or(
      `and(user_id.eq.${userId},buddy_id.eq.${buddy.id}),and(user_id.eq.${buddy.id},buddy_id.eq.${userId})`
    )
    .maybeSingle();

  if (existingError) {
    console.error("Error checking existing buddy relationship:", existingError);
    return { data: null, error: existingError };
  }

  if (existing) {
    return {
      data: null,
      error: new Error("Buddy request already exists or you're already buddies"),
    };
  }

  // Create buddy request
  const { data, error } = await supabase
    .from("buddies")
    .insert({
      user_id: userId,
      buddy_id: buddy.id,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending buddy request:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Accept a buddy request
 * @param requestId - Buddy request UUID
 * @param userId - Current user UUID (to verify this is their request to accept)
 */
export async function acceptBuddyRequest(requestId: string, userId: string) {
  const supabase = createClient();

  // Verify the request is for this user
  const { data, error } = await supabase
    .from("buddies")
    .update({ status: "accepted" })
    .eq("id", requestId)
    .eq("buddy_id", userId) // Only the buddy_id can accept
    .eq("status", "pending")
    .select()
    .single();

  if (error) {
    console.error("Error accepting buddy request:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Reject/delete a buddy request
 * @param requestId - Buddy request UUID
 * @param userId - Current user UUID
 */
export async function rejectBuddyRequest(requestId: string, userId: string) {
  const supabase = createClient();

  // User can reject incoming requests (as buddy_id) or cancel sent requests (as user_id)
  const { error } = await supabase
    .from("buddies")
    .delete()
    .eq("id", requestId)
    .or(`user_id.eq.${userId},buddy_id.eq.${userId}`);

  if (error) {
    console.error("Error rejecting buddy request:", error);
    return { success: false, error };
  }

  return { success: true, error: null };
}

/**
 * Remove a buddy (delete accepted relationship)
 * @param buddyId - Buddy relationship UUID
 * @param userId - Current user UUID
 */
export async function removeBuddy(buddyId: string, userId: string) {
  const supabase = createClient();

  // User can remove buddies where they are user_id or buddy_id
  const { error } = await supabase
    .from("buddies")
    .delete()
    .eq("id", buddyId)
    .or(`user_id.eq.${userId},buddy_id.eq.${userId}`);

  if (error) {
    console.error("Error removing buddy:", error);
    return { success: false, error };
  }

  return { success: true, error: null };
}

/**
 * Check if a buddy is inactive (last_active > 24h ago)
 * @param lastActive - Last active timestamp
 */
export function isBuddyInactive(lastActive: string): boolean {
  const lastActiveDate = new Date(lastActive);
  const now = new Date();
  const hoursSinceActive =
    (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60);

  return hoursSinceActive > 24;
}

/**
 * Get buddy count
 * @param userId - User UUID
 */
export async function getBuddyCount(userId: string) {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("buddies")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "accepted");

  if (error) {
    console.error("Error counting buddies:", error);
    return { count: 0, error };
  }

  return { count: count || 0, error: null };
}

/**
 * Check if two users are buddies
 * @param userId - First user UUID
 * @param otherUserId - Second user UUID
 */
export async function areBuddies(userId: string, otherUserId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("buddies")
    .select("*")
    .or(
      `and(user_id.eq.${userId},buddy_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},buddy_id.eq.${userId})`
    )
    .eq("status", "accepted")
    .maybeSingle();

  if (error) {
    console.error("Error checking buddy relationship:", error);
    return { areBuddies: false, error };
  }

  return { areBuddies: !!data, error: null };
}

/**
 * Send a wake-up nudge to an inactive buddy
 * This is a placeholder - actual implementation would use:
 * - Supabase Edge Function for email
 * - Push notification service
 * - In-app notification
 * @param userId - Current user UUID
 * @param buddyId - Buddy UUID
 */
export async function sendWakeUpNudge(userId: string, buddyId: string) {
  const supabase = createClient();

  // Verify they are buddies
  const { areBuddies: verified } = await areBuddies(userId, buddyId);

  if (!verified) {
    return {
      success: false,
      error: new Error("Cannot nudge non-buddy users"),
    };
  }

  // TODO: Implement actual nudge logic
  // Options:
  // 1. Call Supabase Edge Function
  // 2. Send email via Resend/SendGrid
  // 3. Create in-app notification
  // 4. Send push notification

  // For now, just log
  console.log(`Wake-up nudge sent from ${userId} to ${buddyId}`);

  // Could insert a notification record
  // await supabase.from('notifications').insert({
  //   user_id: buddyId,
  //   type: 'buddy_nudge',
  //   message: `Your buddy wants you to get back to training!`,
  //   from_user_id: userId
  // });

  return { success: true, error: null };
}
