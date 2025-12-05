"use client";

import { useState, useEffect } from "react";
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
import { Shield, Lock, Check } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TOAST_MESSAGES, LOADING_TEXT, BUTTON_LABELS, PLACEHOLDERS, PAGE_TITLES } from "@/lib/dictionary";

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    };
    checkSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: TOAST_MESSAGES.auth.passwordMismatch.title,
        description: TOAST_MESSAGES.auth.passwordMismatch.description,
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: TOAST_MESSAGES.auth.weakPassword.title,
        description: TOAST_MESSAGES.auth.weakPassword.description,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({
        title: TOAST_MESSAGES.auth.passwordUpdated.title,
        description: TOAST_MESSAGES.auth.passwordUpdated.description,
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        title: TOAST_MESSAGES.auth.resetFailed.title,
        description:
          error.message ||
          "Open the link from your email to reset your password.",
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
          {PAGE_TITLES.resetPassword.title}
        </h1>
        <p className="mt-2 text-sm text-muted-text">
          {PAGE_TITLES.resetPassword.subtitle}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{PAGE_TITLES.resetPassword.title}</CardTitle>
          <CardDescription>
            {PAGE_TITLES.resetPassword.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-bold uppercase tracking-wide text-muted-text"
              >
                New Clearance Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
                <Input
                  id="password"
                  type="password"
                  placeholder={PLACEHOLDERS.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-xs font-bold uppercase tracking-wide text-muted-text"
              >
                Confirm Clearance Code
              </label>
              <div className="relative">
                <Check className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={PLACEHOLDERS.confirmPassword}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !hasSession}>
              {loading ? LOADING_TEXT.updating : BUTTON_LABELS.resetPassword}
            </Button>

            {!hasSession && (
              <p className="text-xs text-muted-text">
                Tip: Use the password reset link sent to your email. If this page was opened directly, request a new link.
              </p>
            )}
          </form>

          <Link
            href="/login"
            className="mt-4 inline-flex items-center text-xs text-tactical-red hover:underline"
          >
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
