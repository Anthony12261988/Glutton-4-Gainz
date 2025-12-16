"use client";

import { useState, useEffect } from "react";
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
import { Shield, Mail, Lock, Chrome, Facebook } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  TOAST_MESSAGES,
  LOADING_TEXT,
  BUTTON_LABELS,
  PLACEHOLDERS,
  PAGE_TITLES,
  NAV_LINKS,
} from "@/lib/dictionary";

export function SignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get invite token and email from URL params
  const inviteToken = searchParams.get("invite");
  const inviteEmail = searchParams.get("email");

  const [email, setEmail] = useState(inviteEmail || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Update email if invite email changes
  useEffect(() => {
    if (inviteEmail) {
      setEmail(inviteEmail);
    }
  }, [inviteEmail]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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
      // Determine redirect URL based on invite
      const redirectUrl = inviteToken
        ? `${window.location.origin}/auth/callback?invite=${inviteToken}`
        : `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        toast({
          title: TOAST_MESSAGES.auth.registrationFailed.title,
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user && data.session) {
        // User is signed in automatically
        toast({
          title: TOAST_MESSAGES.auth.registrationSuccess.title,
          description: TOAST_MESSAGES.auth.registrationSuccess.description,
        });

        // If there's an invite token, accept it now
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
              router.push("/onboarding");
            }
          } catch (err) {
            console.error("Error accepting invite:", err);
            router.push("/onboarding");
          }
        } else {
          router.push("/onboarding");
        }
        router.refresh();
      } else {
        // Email confirmation required
        toast({
          title: TOAST_MESSAGES.auth.verificationEmailSent.title,
          description: TOAST_MESSAGES.auth.verificationEmailSent.description,
        });
      }
    } catch (error) {
      toast({
        title: TOAST_MESSAGES.auth.registrationError.title,
        description: TOAST_MESSAGES.auth.registrationError.description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      // Include invite token in redirect if present
      const redirectUrl = inviteToken
        ? `${window.location.origin}/auth/callback?invite=${inviteToken}`
        : `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        toast({
          title: TOAST_MESSAGES.auth.registrationFailed.title,
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: TOAST_MESSAGES.auth.registrationError.title,
        description: TOAST_MESSAGES.auth.registrationError.description,
        variant: "destructive",
      });
    }
  };

  const handleFacebookSignup = async () => {
    try {
      // Include invite token in redirect if present
      const redirectUrl = inviteToken
        ? `${window.location.origin}/auth/callback?invite=${inviteToken}`
        : `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        toast({
          title: TOAST_MESSAGES.auth.registrationFailed.title,
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: TOAST_MESSAGES.auth.registrationError.title,
        description: TOAST_MESSAGES.auth.registrationError.description,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo/Header */}
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-sm border-2 border-tactical-red bg-tactical-red p-6">
            <Image
              src="/G4G_Logo_2.png"
              alt="Glutton4Gainz Logo"
              width={120}
              height={120}
              className="h-auto w-auto"
              priority
            />
          </div>
        </div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-tactical-red">
          ENLIST NOW
        </h1>
        <p className="mt-2 text-sm text-muted-text">
          Join the tactical fitness revolution
        </p>
      </div>

      {/* Signup Card */}
      <Card>
        <CardHeader>
          <CardTitle>{PAGE_TITLES.signup.title}</CardTitle>
          <CardDescription>{PAGE_TITLES.signup.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google OAuth Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
            type="button"
          >
            <Chrome className="mr-2 h-4 w-4" />
            {BUTTON_LABELS.continueWithGoogle}
          </Button>

          {/* Facebook OAuth Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleFacebookSignup}
            type="button"
          >
            <Facebook className="mr-2 h-4 w-4" />
            Continue with Facebook
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-steel/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gunmetal px-2 text-steel">Or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
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
              <p className="text-xs text-steel">Minimum 8 characters</p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-xs font-bold uppercase tracking-wide text-muted-text"
              >
                Confirm Clearance Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? LOADING_TEXT.enlisting : BUTTON_LABELS.signup}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-center text-xs text-steel">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-tactical-red hover:underline">
              Terms of Service
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Login Link */}
      <div className="text-center text-sm text-muted-text">
        {NAV_LINKS.alreadyEnlisted}{" "}
        <Link
          href="/login"
          className="font-bold text-tactical-red hover:underline"
        >
          {NAV_LINKS.loginLink}
        </Link>
      </div>
    </div>
  );
}
