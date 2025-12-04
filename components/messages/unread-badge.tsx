"use client";

import { useUnreadCount } from "@/hooks/use-messages";
import { useUser } from "@/hooks/use-user";

/**
 * Badge component showing unread message count
 * Automatically polls for updates using SWR
 */
export function UnreadMessageBadge() {
  const { user } = useUser();
  const { unreadCount, isLoading } = useUnreadCount(user?.id || "");

  // Don't show anything while loading or if no unread messages
  if (isLoading || !unreadCount || unreadCount === 0) {
    return null;
  }

  return (
    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-tactical-red text-xs font-bold text-white animate-pulse">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}

/**
 * Simple unread indicator dot (for smaller UI elements)
 */
export function UnreadDot() {
  const { user } = useUser();
  const { unreadCount, isLoading } = useUnreadCount(user?.id || "");

  if (isLoading || !unreadCount || unreadCount === 0) {
    return null;
  }

  return (
    <span className="absolute top-0 right-0 flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tactical-red opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-tactical-red"></span>
    </span>
  );
}
