import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

/**
 * Get all messages for a user (sent and received)
 * @param userId - User UUID
 * @param limit - Optional limit for pagination
 * @param offset - Optional offset for pagination
 */
export async function getMessages(
  userId: string,
  limit?: number,
  offset?: number
) {
  const supabase = createClient();

  let query = supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, email, avatar_url),
      receiver:profiles!messages_receiver_id_fkey(id, email, avatar_url)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.range(offset || 0, (offset || 0) + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching messages:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get conversation between two users
 * @param userId - Current user UUID
 * @param otherUserId - Other user UUID
 * @param limit - Optional limit
 */
export async function getConversation(
  userId: string,
  otherUserId: string,
  limit?: number
) {
  const supabase = createClient();

  let query = supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, email, avatar_url),
      receiver:profiles!messages_receiver_id_fkey(id, email, avatar_url)
    `)
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });

  if (limit) {
    // Get the most recent N messages
    const { data: allData, error: fetchError } = await supabase
      .from("messages")
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, email, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(id, email, avatar_url)
      `)
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (fetchError) {
      console.error("Error fetching conversation:", fetchError);
      return { data: null, error: fetchError };
    }

    // Reverse to get chronological order
    return { data: allData?.reverse() || [], error: null };
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching conversation:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Send a message
 * @param senderId - Sender user UUID
 * @param receiverId - Receiver user UUID
 * @param content - Message content
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      is_read: false,
    })
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, email, avatar_url),
      receiver:profiles!messages_receiver_id_fkey(id, email, avatar_url)
    `)
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Mark a message as read
 * @param messageId - Message UUID
 */
export async function markAsRead(messageId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("id", messageId)
    .select()
    .single();

  if (error) {
    console.error("Error marking message as read:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Mark all messages from a specific sender as read
 * @param receiverId - Current user UUID
 * @param senderId - Sender UUID
 */
export async function markConversationAsRead(
  receiverId: string,
  senderId: string
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_id", receiverId)
    .eq("sender_id", senderId)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking conversation as read:", error);
    return { success: false, error };
  }

  return { success: true, error: null };
}

/**
 * Get unread message count for a user
 * @param userId - User UUID
 */
export async function getUnreadCount(userId: string) {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error fetching unread count:", error);
    return { count: 0, error };
  }

  return { count: count || 0, error: null };
}

/**
 * Get list of users you have conversations with
 * @param userId - User UUID
 */
export async function getConversationList(userId: string) {
  const supabase = createClient();

  // Get all messages where user is sender or receiver
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, email, avatar_url),
      receiver:profiles!messages_receiver_id_fkey(id, email, avatar_url)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversation list:", error);
    return { data: null, error };
  }

  // Group by conversation partner
  const conversationMap = new Map();

  messages.forEach((message) => {
    const partnerId =
      message.sender_id === userId ? message.receiver_id : message.sender_id;

    if (!conversationMap.has(partnerId)) {
      const partner =
        message.sender_id === userId ? message.receiver : message.sender;

      conversationMap.set(partnerId, {
        userId: partnerId,
        userEmail: partner.email,
        userAvatar: partner.avatar_url,
        lastMessage: message.content,
        lastMessageAt: message.created_at,
        unread: message.receiver_id === userId && !message.is_read,
      });
    }
  });

  return { data: Array.from(conversationMap.values()), error: null };
}

/**
 * Delete a message (only if sender)
 * @param messageId - Message UUID
 * @param userId - User UUID (to verify ownership)
 */
export async function deleteMessage(messageId: string, userId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId)
    .eq("sender_id", userId); // Only sender can delete

  if (error) {
    console.error("Error deleting message:", error);
    return { success: false, error };
  }

  return { success: true, error: null };
}

/**
 * Get messages sent to coach (for coach inbox)
 * @param coachId - Coach user UUID
 * @param limit - Optional limit
 */
export async function getCoachInbox(coachId: string, limit?: number) {
  const supabase = createClient();

  let query = supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, email, avatar_url, tier)
    `)
    .eq("receiver_id", coachId)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching coach inbox:", error);
    return { data: null, error };
  }

  return { data, error: null };
}
