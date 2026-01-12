"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error("Application Error:", error);

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <div className="relative min-h-screen bg-gunmetal flex items-center justify-center p-4">
      {/* Watermark Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div 
          className="absolute inset-0 z-[1] opacity-[0.15] bg-repeat-y bg-top bg-contain"
          style={{
            backgroundImage: 'url(/branding/IMG_5618.PNG)',
          }}
        />
      </div>
      <div className="relative z-10">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="bg-tactical-red/10 rounded-full p-6 border-2 border-tactical-red/20">
            <AlertTriangle className="h-16 w-16 text-tactical-red" />
          </div>
        </div>

        {/* Error Title */}
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
            Mission Failed
          </h1>
          <p className="text-steel text-sm uppercase tracking-wide">
            ERROR CODE: {error.digest || "UNKNOWN"}
          </p>
        </div>

        {/* Error Description */}
        <div className="bg-gunmetal-light border border-steel/20 rounded-sm p-4">
          <p className="text-steel/80 text-sm">
            An unexpected error occurred during the operation. Your progress has
            been preserved, and you can try again.
          </p>

          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left">
              <summary className="text-xs text-tactical-red cursor-pointer hover:text-red-400 uppercase tracking-wide">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-steel/60 overflow-auto p-2 bg-gunmetal rounded">
                {error.message}
              </pre>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-tactical-red hover:bg-red-700 font-bold uppercase tracking-wider"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Mission
          </Button>

          <Link href="/dashboard" className="block">
            <Button
              variant="ghost"
              className="w-full text-steel hover:text-white hover:bg-gunmetal-light uppercase tracking-wider"
            >
              <Home className="h-4 w-4 mr-2" />
              Return to Base
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-xs text-steel/40">
          If this problem persists, contact support with error code:{" "}
          <span className="text-tactical-red font-mono">
            {error.digest || "N/A"}
          </span>
        </p>
      </div>
      </div>
    </div>
  );
}
