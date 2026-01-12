"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical global error
    console.error("Global Application Error:", error);

    // TODO: Send to error tracking service with high priority
    // Example: Sentry.captureException(error, { level: 'fatal' });
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="relative bg-gunmetal antialiased">
        {/* Watermark Background */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div 
            className="absolute inset-0 z-[1] opacity-[0.15] bg-repeat-y bg-top bg-contain"
            style={{
              backgroundImage: 'url(/branding/IMG_5618.PNG)',
            }}
          />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="bg-tactical-red/10 rounded-full p-6 border-2 border-tactical-red/20">
                <svg
                  className="h-16 w-16 text-tactical-red"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Title */}
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
                Critical System Error
              </h1>
              <p className="text-steel text-sm uppercase tracking-wide">
                ERROR CODE: {error.digest || "CRITICAL"}
              </p>
            </div>

            {/* Error Description */}
            <div className="bg-gunmetal-light border border-steel/20 rounded p-4">
              <p className="text-steel/80 text-sm">
                A critical error has occurred. The application needs to be
                reloaded. Your data is safe.
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={reset}
              className="w-full bg-tactical-red hover:bg-red-700 text-white font-bold uppercase tracking-wider py-3 px-6 rounded transition-colors"
            >
              Reload Application
            </button>

            {/* Help Text */}
            <p className="text-xs text-steel/40">
              If this problem persists after reloading, please clear your
              browser cache and try again.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
