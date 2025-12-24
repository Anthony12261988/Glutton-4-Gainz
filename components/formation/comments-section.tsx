"use client";

import { useState, useEffect } from "react";
import { getPostComments, addComment } from "@/lib/queries/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CommentsSection({ postId, currentUserId }: any) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
  }, [postId]);

  async function loadComments() {
    const { data, error } = await getPostComments(postId);
    if (!error) setComments(data || []);
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;

    setLoading(true);
    const { error } = await addComment(postId, newComment);

    if (error) {
      toast({ title: "COMMENT FAILED", description: error.message, variant: "destructive" });
    } else {
      setNewComment("");
      loadComments();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-3 pt-3 border-t border-steel/20">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-tactical-red/20 flex items-center justify-center flex-shrink-0">
            <span className="text-tactical-red text-xs font-bold">
              {comment.author?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-steel">
              {comment.author?.email?.split('@')[0]}
            </p>
            <p className="text-sm text-high-vis">{comment.content}</p>
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
          className="bg-black/20 border-steel/30"
          maxLength={500}
        />
        <Button
          size="sm"
          onClick={handleAddComment}
          disabled={!newComment.trim() || loading}
          className="bg-tactical-red hover:bg-red-700"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
