"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
  import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CompleteMissionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (duration: number, notes: string) => Promise<void> | void;
  loading?: boolean;
}

export function CompleteMissionModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: CompleteMissionModalProps) {
  const [duration, setDuration] = useState<string>("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setDuration("");
      setNotes("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = Number(duration);
    if (!minutes || minutes <= 0) return;
    await onSubmit(minutes, notes);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Mission</DialogTitle>
          <DialogDescription>
            Log your mission details to secure XP and streak updates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="duration"
              className="text-xs font-bold uppercase tracking-wide text-muted-text"
            >
              Duration (minutes)
            </label>
            <Input
              id="duration"
              type="number"
              min="1"
              placeholder="45"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="text-xs font-bold uppercase tracking-wide text-muted-text"
            >
              Notes (optional)
            </label>
            <Textarea
              id="notes"
              placeholder="Mission details, effort, obstacles..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Logging..." : "Complete"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
