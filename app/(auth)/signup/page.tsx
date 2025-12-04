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
import { Shield, Mail, Lock, User, Chrome } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
        title: "PASSWORD MISMATCH",
        description: "Passwords do not match. Try again, soldier.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "WEAK PASSWORD",
        description: "Password must be at least 8 characters.",
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
          title: "REGISTRATION FAILED",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user && data.session) {
        // User is signed in automatically (if email confirmation is disabled or not required for login)
        toast({
          title: "ENLISTMENT SUCCESSFUL",
          description: "Welcome to the unit.",
        });
        router.push("/onboarding");
        router.refresh();
      } else {
        // Email confirmation required
        toast({
          title: "CHECK YOUR COMMS",
          description: "Verification email sent. Confirm to proceed.",
        });
      }
    } catch (error) {
      toast({
        title: "ERROR",
        description: "An unexpected error occurred.",
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
          title: "REGISTRATION FAILED",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "ERROR",
        description: "An unexpected error occurred.",
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
          <CardTitle>CREATE ACCOUNT</CardTitle>
          <CardDescription>Sign up and complete Day Zero Test</CardDescription>
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
            Continue with Google
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
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
                <Input
                  id="email"
                  type="email"
                  placeholder="soldier@example.com"
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
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
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
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "ENLISTING..." : "SIGN UP"}
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
        Already enlisted?{" "}
        <Link
          href="/login"
          className="font-bold text-tactical-red hover:underline"
        >
          Login here
        </Link>
      </div>
    </div>
  );
}
