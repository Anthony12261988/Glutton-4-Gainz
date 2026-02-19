"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Shield, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  TOAST_MESSAGES,
  LOADING_TEXT,
  BUTTON_LABELS,
  PLACEHOLDERS,
  PAGE_TITLES,
  NAV_LINKS,
} from "@/lib/dictionary";

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get invite token from URL if present
  const inviteToken = searchParams.get("invite");
  const inviteEmail = searchParams.get("email");
  const redirectTo = searchParams.get("redirect");

  const [email, setEmail] = useState(inviteEmail || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: TOAST_MESSAGES.auth.loginFailed.title,
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        toast({
          title: TOAST_MESSAGES.auth.loginSuccess.title,
          description: TOAST_MESSAGES.auth.loginSuccess.description,
        });

        // If there's an invite token, accept it
        if (inviteToken) {
          try {
            const acceptResponse = await fetch("/api/accept-coach-invite", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: inviteToken,
                userId: data.user.id,
                email: data.user.email,
              }),
            });

            const acceptResult = await acceptResponse.json();

            if (acceptResult.success) {
              toast({
                title: "COMMISSION ACCEPTED",
                description: "Welcome to the officer corps, Coach!",
              });
              router.push("/barracks");
            } else {
              console.error("Failed to accept invite:", acceptResult.error);
              router.push("/dashboard");
            }
          } catch (err) {
            console.error("Error accepting invite:", err);
            router.push("/dashboard");
          }
        } else {
          const safeRedirect =
            redirectTo && redirectTo.startsWith("/") ? redirectTo : null;
          router.push(safeRedirect ?? "/dashboard");
        }
        router.refresh();
      }
    } catch (error) {
      toast({
        title: TOAST_MESSAGES.auth.loginError.title,
        description: TOAST_MESSAGES.auth.loginError.description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signupHref = (() => {
    const params = new URLSearchParams();
    if (inviteToken) params.set("invite", inviteToken);
    if (inviteEmail) params.set("email", inviteEmail);
    if (redirectTo && redirectTo.startsWith("/")) {
      params.set("redirect", redirectTo);
    }
    const query = params.toString();
    return query ? `/signup?${query}` : "/signup";
  })();

  return (
    <div className="space-y-6">
      {/* Logo/Header */}
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-sm border-2 border-tactical-red bg-tactical-red p-6">
            <Image
              src="/IMG_5614.PNG"
              alt="Glutton4Gainz Logo"
              width={120}
              height={120}
              className="h-auto w-auto"
              priority
            />
          </div>
        </div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-tactical-red">
          GLUTTON4GAINZ
        </h1>
        <p className="mt-1 text-[11px] uppercase tracking-wide text-steel">
          Powered by{" "}
          <Link
            href="https://prvmalfitness.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-tactical-red hover:text-red-300 transition-colors"
          >
            Prvmal Fitness
          </Link>
        </p>
        <p className="mt-2 text-sm text-muted-text">
          {PAGE_TITLES.login.subtitle}
        </p>
      </div>

      {/* Login Card */}
      <Card>
        <CardHeader>
          <CardTitle>{PAGE_TITLES.login.title}</CardTitle>
          <CardDescription>{PAGE_TITLES.login.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
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

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-bold uppercase tracking-wide text-muted-text"
              >
                Clearance Code
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? LOADING_TEXT.authenticating : BUTTON_LABELS.login}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-xs text-tactical-red hover:underline"
            >
              {BUTTON_LABELS.forgotPassword}
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Signup Link */}
      <div className="text-center text-sm text-muted-text">
        {NAV_LINKS.newRecruit}{" "}
        <Link
          href={signupHref}
          className="font-bold text-tactical-red hover:underline"
        >
          {NAV_LINKS.signUpLink}
        </Link>
      </div>
    </div>
  );
}
