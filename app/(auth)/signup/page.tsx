"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Shield, Mail, Lock, User, Chrome, Facebook } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TOAST_MESSAGES, LOADING_TEXT, BUTTON_LABELS, PLACEHOLDERS, PAGE_TITLES, NAV_LINKS } from "@/lib/dictionary";

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: TOAST_MESSAGES.auth.registrationFailed.title,
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user && data.session) {
        // User is signed in automatically (if email confirmation is disabled or not required for login)
        toast({
          title: TOAST_MESSAGES.auth.registrationSuccess.title,
          description: TOAST_MESSAGES.auth.registrationSuccess.description,
        });
        router.push("/onboarding");
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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
          <div className="rounded-sm border-2 border-tactical-red bg-gunmetal p-4">
            <Shield className="h-12 w-12 text-tactical-red" strokeWidth={2.5} />
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
