"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TOAST_MESSAGES, LOADING_TEXT, PLACEHOLDERS, PAGE_TITLES } from "@/lib/dictionary";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: TOAST_MESSAGES.auth.resetLinkSent.title,
        description: TOAST_MESSAGES.auth.resetLinkSent.description,
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        title: TOAST_MESSAGES.auth.resetRequestFailed.title,
        description: error.message || TOAST_MESSAGES.auth.resetRequestFailed.description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-sm border-2 border-tactical-red bg-gunmetal p-4">
            <Shield className="h-12 w-12 text-tactical-red" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-tactical-red">
          {PAGE_TITLES.forgotPassword.title}
        </h1>
        <p className="mt-2 text-sm text-muted-text">
          {PAGE_TITLES.forgotPassword.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{PAGE_TITLES.forgotPassword.title}</CardTitle>
          <CardDescription>{PAGE_TITLES.forgotPassword.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wide text-muted-text"
              >
                Soldier ID (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
                <Input
                  id="email"
                  type="email"
                  placeholder={PLACEHOLDERS.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? LOADING_TEXT.sending : "SEND RESET LINK"}
            </Button>
          </form>

          <Link
            href="/login"
            className="mt-4 inline-flex items-center text-xs text-tactical-red hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
