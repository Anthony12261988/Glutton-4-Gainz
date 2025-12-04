"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user has already dismissed
      const dismissed = localStorage.getItem("pwa-prompt-dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 bg-gunmetal border border-tactical-red/50 p-4 rounded-sm shadow-lg z-50 animate-in slide-in-from-bottom-10">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-heading font-bold text-white uppercase tracking-wide mb-1">
            Install App
          </h3>
          <p className="text-sm text-steel mb-3">
            Add G4G to your home screen for quick access and offline capabilities.
          </p>
          <Button 
            onClick={handleInstall}
            size="sm" 
            className="bg-tactical-red hover:bg-red-700 w-full"
          >
            <Download className="mr-2 h-4 w-4" /> INSTALL NOW
          </Button>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-steel hover:text-white ml-2"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
