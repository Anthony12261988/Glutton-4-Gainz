-- Migration 053: Formation RLS Policies
-- Row Level Security for posts, likes, and comments

-- Enable RLS for posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view posts
DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT TO authenticated USING (true);

-- Users can create own posts
DROP POLICY IF EXISTS "Users can create own posts" ON posts;
CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own posts
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete own posts
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Enable RLS for post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
DROP POLICY IF EXISTS "Anyone can view likes" ON post_likes;
CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT TO authenticated USING (true);

-- Users can like posts
DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike posts
DROP POLICY IF EXISTS "Users can unlike posts" ON post_likes;
CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Enable RLS for post_comments
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments
DROP POLICY IF EXISTS "Anyone can view comments" ON post_comments;
CREATE POLICY "Anyone can view comments"
  ON post_comments FOR SELECT TO authenticated USING (true);

-- Users can comment
DROP POLICY IF EXISTS "Users can comment" ON post_comments;
CREATE POLICY "Users can comment"
  ON post_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own comments
DROP POLICY IF EXISTS "Users can update own comments" ON post_comments;
CREATE POLICY "Users can update own comments"
  ON post_comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete own comments
DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;
CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
