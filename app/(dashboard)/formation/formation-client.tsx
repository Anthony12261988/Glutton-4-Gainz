"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getFormationFeed } from "@/lib/queries/posts";
import { PostCard } from "@/components/formation/post-card";
import { CreatePostModal } from "@/components/formation/create-post-modal";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FormationClient({ user, profile }: any) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadPosts();

    // Real-time subscription
    const channel = supabase
      .channel('formation-feed')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, () => {
        loadPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadPosts() {
    const { data, error } = await getFormationFeed(20, 0);
    if (error) {
      toast({
        title: "FEED LOAD FAILED",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
            Formation
          </h1>
          <p className="text-sm text-muted-text">
            Share your progress with the squad
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-tactical-red hover:bg-red-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-muted-text">Loading formation...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-steel mb-4" />
            <p className="text-muted-text">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user.id} onUpdate={loadPosts} />
          ))
        )}
      </div>

      <CreatePostModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadPosts}
      />
    </div>
  );
}
