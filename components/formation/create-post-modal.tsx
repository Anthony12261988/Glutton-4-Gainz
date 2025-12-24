"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createPost } from "@/lib/queries/posts";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

export function CreatePostModal({ open, onClose, onSuccess }: any) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  async function handleSubmit() {
    if (!content.trim()) return;

    setUploading(true);

    try {
      let imageUrl: string | undefined;

      // Upload image if selected
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Create post
      const { error } = await createPost(content, imageUrl);
      if (error) throw error;

      toast({ title: "POST CREATED", description: "Your post is now live!" });
      setContent("");
      setImage(null);
      onClose();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "POST FAILED",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gunmetal border-steel">
        <DialogHeader>
          <DialogTitle className="text-high-vis">Create Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Share your progress with the squad..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-black/20 border-steel/30 min-h-[120px]"
            maxLength={2000}
          />
          <div className="text-xs text-muted-text text-right">
            {content.length}/2000
          </div>
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="bg-black/20 border-steel/30"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || uploading}
              className="bg-tactical-red hover:bg-red-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
