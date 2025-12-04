"use client";

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

/**
 * Fetcher function for conversations list
 */
async function fetchConversations(userId: string) {
  const { data, error } = await supabase.rpc("get_conversation_list", {
    p_user_id: userId,
  });

  if (error) throw error;
  return data || [];
}

/**
 * Fetcher function for unread message count
 */
async function fetchUnreadCount(userId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("to_user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
  return data || 0;
}

/**
 * Fetcher function for a specific conversation
 */
async function fetchConversation(userId: string, otherUserId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      from_user:from_user_id (
        id,
        full_name,
        role
      ),
      to_user:to_user_id (
        id,
        full_name,
        role
      )
    `
    )
    .or(
      `and(from_user_id.eq.${userId},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export interface UseMessagesOptions {
  /**
   * User ID to fetch messages for
   */
  userId: string;

  /**
   * Polling interval in milliseconds (default: 10000ms = 10s)
   */
  refreshInterval?: number;

  /**
   * Whether to automatically refetch on window focus
   */
  revalidateOnFocus?: boolean;
}

/**
 * Hook to fetch and poll for new messages
 * Uses SWR for automatic revalidation and caching
 */
export function useMessages({
  userId,
  refreshInterval = 10000,
  revalidateOnFocus = true,
}: UseMessagesOptions) {
  const {
    data: conversations,
    error: conversationsError,
    mutate: refetchConversations,
    isLoading: conversationsLoading,
  } = useSWR(
    userId ? `conversations-${userId}` : null,
    () => fetchConversations(userId),
    {
      refreshInterval,
      revalidateOnFocus,
      dedupingInterval: 5000,
    }
  );

  return {
    conversations,
    conversationsError,
    conversationsLoading,
    refetchConversations,
  };
}

/**
 * Hook to fetch and poll for unread message count
 * Polls more frequently for real-time unread badge updates
 */
export function useUnreadCount(userId: string) {
  const {
    data: unreadCount,
    error,
    mutate: refetchUnreadCount,
    isLoading,
  } = useSWR(
    userId ? `unread-count-${userId}` : null,
    () => fetchUnreadCount(userId),
    {
      refreshInterval: 5000, // Poll every 5 seconds for unread count
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    unreadCount: unreadCount || 0,
    error,
    refetchUnreadCount,
    isLoading,
  };
}

/**
 * Hook to fetch a specific conversation with another user
 * Polls for new messages in the conversation
 */
export function useConversation(userId: string, otherUserId: string | null) {
  const {
    data: messages,
    error,
    mutate: refetchMessages,
    isLoading,
  } = useSWR(
    userId && otherUserId ? `conversation-${userId}-${otherUserId}` : null,
    () => fetchConversation(userId, otherUserId!),
    {
      refreshInterval: 5000, // Poll every 5 seconds for new messages
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    messages: messages || [],
    error,
    refetchMessages,
    isLoading,
  };
}

/**
 * Hook to mark messages as read and update cache
 */
export function useMarkAsRead() {
  const markAsRead = async (messageIds: string[], userId: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .in("id", messageIds)
      .eq("to_user_id", userId);

    if (error) throw error;
  };

  return { markAsRead };
}
