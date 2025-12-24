"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { togglePostLike, deletePost } from "@/lib/queries/posts";
import { CommentsSection } from "./comments-section";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export function PostCard({ post, currentUserId, onUpdate }: any) {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.has_liked?.length > 0);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const { toast } = useToast();

  async function handleLike() {
    const { liked: newLiked, error } = await togglePostLike(post.id);
    if (error) {
      toast({ title: "LIKE FAILED", description: error.message, variant: "destructive" });
    } else {
      setLiked(newLiked);
      setLikesCount((prev: number) => newLiked ? prev + 1 : prev - 1);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;

    const { error } = await deletePost(post.id);
    if (error) {
      toast({ title: "DELETE FAILED", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "POST DELETED", description: "Your post has been removed." });
      onUpdate();
    }
  }

  return (
    <Card className="bg-gunmetal border-steel/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-tactical-red/20 flex items-center justify-center">
              <span className="text-tactical-red font-bold">
                {post.author?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-heading text-sm font-bold text-high-vis">
                {post.author?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-muted-text">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {currentUserId === post.user_id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-tactical-red hover:bg-tactical-red/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-high-vis whitespace-pre-wrap">{post.content}</p>

        {post.image_url && (
          <div className="relative w-full aspect-video rounded-sm overflow-hidden">
            <Image
              src={post.image_url}
              alt="Post image"
              fill
              className="object-cover"
            />
          </div>
        )}

        {post.workout && (
          <div className="bg-gunmetal/50 border border-steel/20 rounded-sm p-3">
            <p className="text-xs text-muted-text">Workout Completed</p>
            <p className="text-sm font-bold text-high-vis">{post.workout.title}</p>
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t border-steel/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={liked ? "text-tactical-red" : "text-steel"}
          >
            <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
            {likesCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-steel"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {post.comments_count}
          </Button>
        </div>

        {showComments && (
          <CommentsSection postId={post.id} currentUserId={currentUserId} />
        )}
      </CardContent>
    </Card>
  );
}
