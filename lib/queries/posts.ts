import { createClient as createClientClient } from "@/lib/supabase/client";

/**
 * Get Formation feed with posts, author info, and user's like status
 */
export async function getFormationFeed(limit = 20, offset = 0) {
  const supabase = createClientClient();

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles!user_id(id, email, tier, xp, current_streak),
      workout:workouts(id, title),
      user_log:user_logs(id, notes, completed),
      has_liked:post_likes(user_id)
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return { data, error };
}

/**
 * Create a new post
 */
export async function createPost(
  content: string,
  imageUrl?: string,
  workoutId?: string,
  userLogId?: string
) {
  const supabase = createClientClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      content,
      image_url: imageUrl,
      workout_id: workoutId,
      user_log_id: userLogId,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Toggle like on a post
 */
export async function togglePostLike(postId: string) {
  const supabase = createClientClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("id", existingLike.id);
    return { liked: false, error };
  } else {
    // Like
    const { error } = await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: user.id });
    return { liked: true, error };
  }
}

/**
 * Get comments for a post
 */
export async function getPostComments(postId: string) {
  const supabase = createClientClient();

  const { data, error } = await supabase
    .from("post_comments")
    .select(`
      *,
      author:profiles!user_id(id, email, tier)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  return { data, error };
}

/**
 * Add a comment to a post
 */
export async function addComment(
  postId: string,
  content: string
) {
  const supabase = createClientClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      content,
    })
    .select(`
      *,
      author:profiles!user_id(id, email, tier)
    `)
    .single();

  return { data, error };
}

/**
 * Delete a post
 */
export async function deletePost(postId: string) {
  const supabase = createClientClient();

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  return { error };
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
  const supabase = createClientClient();

  const { error } = await supabase
    .from("post_comments")
    .delete()
    .eq("id", commentId);

  return { error };
}
