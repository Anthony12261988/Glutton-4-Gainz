"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Users, MessageSquare, Send, RefreshCw, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  email: string;
  tier: string;
  last_active: string;
  avatar_url?: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface CoachDashboardProps {
  coachId: string;
  initialTrainees: Profile[];
}

export default function CoachDashboard({
  coachId,
  initialTrainees,
}: CoachDashboardProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const [trainees, setTrainees] = useState<Profile[]>(initialTrainees);
  const [selectedTrainee, setSelectedTrainee] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Polling for messages
  useEffect(() => {
    if (!selectedTrainee) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${coachId},receiver_id.eq.${selectedTrainee.id}),and(sender_id.eq.${selectedTrainee.id},receiver_id.eq.${coachId})`
        )
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [selectedTrainee, coachId, supabase]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainee || !newMessage.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: coachId,
        receiver_id: selectedTrainee.id,
        content: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage("");
      // Optimistic update or wait for poll? Let's wait for poll or fetch immediately
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${coachId},receiver_id.eq.${selectedTrainee.id}),and(sender_id.eq.${selectedTrainee.id},receiver_id.eq.${coachId})`
        )
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
    } catch (error: any) {
      toast({
        title: "TRANSMISSION FAILED",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Trainee List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-tactical-red" />
            SQUAD ROSTER
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {trainees.length === 0 ? (
            <div className="p-6 text-center text-muted-text">
              No recruits assigned.
            </div>
          ) : (
            <div className="divide-y divide-steel/20">
              {trainees.map((trainee) => (
                <button
                  key={trainee.id}
                  onClick={() => setSelectedTrainee(trainee)}
                  className={cn(
                    "flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gunmetal",
                    selectedTrainee?.id === trainee.id &&
                      "bg-tactical-red/10 border-l-4 border-tactical-red"
                  )}
                >
                  <div>
                    <p className="font-bold text-high-vis">{trainee.email}</p>
                    <p className="text-xs text-muted-text">
                      Tier: {trainee.tier}
                    </p>
                  </div>
                  <Shield className="h-4 w-4 text-steel" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Center */}
      <Card className="flex h-[400px] md:h-[600px] lg:h-[700px] flex-col md:col-span-2">
        <CardHeader className="border-b border-steel/20">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-tactical-red" />
            {selectedTrainee
              ? `COMMS: ${selectedTrainee.email}`
              : "SECURE COMMS"}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col p-0">
          {selectedTrainee ? (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-text">
                    No transmission history.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === coachId;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex w-full",
                          isMe ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] sm:max-w-[70%] md:max-w-[60%] rounded-sm p-3 text-sm",
                            isMe
                              ? "bg-tactical-red text-high-vis"
                              : "bg-gunmetal text-high-vis border border-steel"
                          )}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={cn(
                              "mt-1 text-[10px]",
                              isMe ? "text-white/70" : "text-muted-text"
                            )}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-steel/20 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type message..."
                    className="bg-gunmetal"
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-text">
              Select a recruit to establish comms.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
