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
import { Shield, Mail, Lock, Chrome } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "LOGIN FAILED",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "ACCESS GRANTED",
          description: "Welcome back, soldier.",
        });
        router.push("/dashboard");
        router.refresh();
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

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: "LOGIN FAILED",
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
          GLUTTON4GAMES
        </h1>
        <p className="mt-2 text-sm text-muted-text">
          Tactical Fitness Training System
        </p>
      </div>

      {/* Login Card */}
      <Card>
        <CardHeader>
          <CardTitle>LOGIN</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google OAuth Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
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
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "AUTHENTICATING..." : "LOGIN"}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-xs text-tactical-red hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Signup Link */}
      <div className="text-center text-sm text-muted-text">
        New recruit?{" "}
        <Link
          href="/signup"
          className="font-bold text-tactical-red hover:underline"
        >
          Sign up for deployment
        </Link>
      </div>
    </div>
  );
}
