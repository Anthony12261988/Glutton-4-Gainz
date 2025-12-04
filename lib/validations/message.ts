import { z } from "zod";

/**
 * Send message validation schema
 */
export const sendMessageSchema = z.object({
  to_user_id: z
    .string()
    .uuid("Invalid recipient ID")
    .min(1, "Recipient is required"),
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message cannot exceed 1000 characters")
    .trim(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

/**
 * Buddy request validation schema
 */
export const buddyRequestSchema = z.object({
  buddy_email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required")
    .toLowerCase()
    .trim(),
});

export type BuddyRequestInput = z.infer<typeof buddyRequestSchema>;
