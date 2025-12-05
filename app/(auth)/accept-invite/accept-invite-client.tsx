"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, CheckCircle, XCircle, UserPlus } from "lucide-react";
import Link from "next/link";

interface AcceptInviteClientProps {
  token: string;
  isLoggedIn: boolean;
  userEmail: string | null;
  userId: string | null;
}

type InviteStatus =
  | "loading"
  | "valid"
  | "invalid"
  | "expired"
  | "accepting"
  | "accepted"
  | "error";

export function AcceptInviteClient({
  token,
  isLoggedIn,
  userEmail,
  userId,
}: AcceptInviteClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<InviteStatus>("loading");
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validate invite token on mount
  useEffect(() => {
    const validateInvite = async () => {
      try {
        const response = await fetch("/api/validate-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok || !result.valid) {
          setStatus(result.expired ? "expired" : "invalid");
          setError(result.error || "Invalid invite");
          return;
        }

        setInviteEmail(result.email);
        setStatus("valid");

        // If user is logged in with matching email, auto-accept
        if (
          isLoggedIn &&
          userEmail &&
          userId &&
          userEmail.toLowerCase() === result.email.toLowerCase()
        ) {
          await acceptInvite();
        }
      } catch (err) {
        console.error("Error validating invite:", err);
        setStatus("error");
        setError("Failed to validate invite");
      }
    };

    validateInvite();
  }, [token, isLoggedIn, userEmail, userId]);

  const acceptInvite = async () => {
    if (!userId || !userEmail) return;

    setStatus("accepting");
    try {
      const response = await fetch("/api/accept-coach-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, userId, email: userEmail }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setStatus("error");
        setError(result.error || "Failed to accept invite");
        return;
      }

      setStatus("accepted");
      toast({
        title: "COMMISSION ACCEPTED",
        description: "Welcome to the officer corps, Coach!",
      });

      // Redirect to barracks after short delay
      setTimeout(() => {
        router.push("/barracks");
        router.refresh();
      }, 2000);
    } catch (err) {
      console.error("Error accepting invite:", err);
      setStatus("error");
      setError("Failed to accept invite");
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-tactical-red" />
        <p className="font-heading text-xl uppercase tracking-wider text-high-vis">
          Verifying Orders...
        </p>
      </div>
    );
  }

  // Invalid or expired invite
  if (status === "invalid" || status === "expired") {
    return (
      <Card className="border-steel/30 bg-gunmetal">
        <CardHeader className="text-center">
          <XCircle className="mx-auto mb-4 h-16 w-16 text-tactical-red" />
          <CardTitle className="font-heading text-2xl uppercase text-tactical-red">
            {status === "expired" ? "Orders Expired" : "Invalid Orders"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-text">
            {status === "expired"
              ? "This commission offer has expired or already been accepted."
              : "This invite link is invalid or has been revoked."}
          </p>
          <Link href="/login">
            <Button variant="outline" className="mt-4">
              Return to Base
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <Card className="border-steel/30 bg-gunmetal">
        <CardHeader className="text-center">
          <XCircle className="mx-auto mb-4 h-16 w-16 text-tactical-red" />
          <CardTitle className="font-heading text-2xl uppercase text-tactical-red">
            Transmission Error
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-text">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Accepting state
  if (status === "accepting") {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-radar-green" />
        <p className="font-heading text-xl uppercase tracking-wider text-high-vis">
          Processing Commission...
        </p>
      </div>
    );
  }

  // Accepted state
  if (status === "accepted") {
    return (
      <Card className="border-radar-green/30 bg-gunmetal">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-radar-green" />
          <CardTitle className="font-heading text-2xl uppercase text-radar-green">
            Commission Accepted!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-text">
            Welcome to the officer corps. Redirecting to your barracks...
          </p>
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-radar-green" />
        </CardContent>
      </Card>
    );
  }

  // Valid invite - show signup/login prompt
  return (
    <Card className="border-tactical-red/30 bg-gunmetal">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 rounded-sm border-2 border-tactical-red bg-tactical-red/10 p-4">
          <Shield className="h-12 w-12 text-tactical-red" />
        </div>
        <CardTitle className="font-heading text-2xl uppercase text-high-vis">
          Officer Commission
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-muted-text mb-2">
            You have been selected for a coach position at Glutton4Games.
          </p>
          {inviteEmail && (
            <p className="text-sm text-steel">
              This invitation is for:{" "}
              <span className="text-high-vis">{inviteEmail}</span>
            </p>
          )}
        </div>

        {isLoggedIn ? (
          // User is logged in but email doesn't match
          <div className="space-y-4">
            <div className="rounded-sm border border-amber-500/30 bg-amber-500/10 p-4 text-center">
              <p className="text-sm text-amber-400">
                You're logged in as <strong>{userEmail}</strong>, but this
                invite is for <strong>{inviteEmail}</strong>.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/api/auth/signout" className="flex-1">
                <Button variant="outline" className="w-full">
                  Sign Out
                </Button>
              </Link>
              <Link
                href={`/signup?invite=${token}&email=${encodeURIComponent(
                  inviteEmail || ""
                )}`}
                className="flex-1"
              >
                <Button className="w-full bg-tactical-red hover:bg-red-700">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // User not logged in - show signup/login options
          <div className="space-y-4">
            <Link
              href={`/signup?invite=${token}&email=${encodeURIComponent(
                inviteEmail || ""
              )}`}
            >
              <Button className="w-full bg-tactical-red hover:bg-red-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account & Accept
              </Button>
            </Link>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-steel/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gunmetal px-2 text-muted-text">
                  Already have an account?
                </span>
              </div>
            </div>
            <Link
              href={`/login?invite=${token}&email=${encodeURIComponent(
                inviteEmail || ""
              )}`}
            >
              <Button variant="outline" className="w-full">
                Sign In & Accept
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
