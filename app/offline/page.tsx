import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-camo-black p-4 text-center">
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
      <WifiOff className="mb-6 h-24 w-24 text-steel/50" />
      <h1 className="font-heading text-4xl font-bold uppercase tracking-wider text-white mb-4">
        Comms Down
      </h1>
      <p className="text-steel mb-8 max-w-md">
        You are currently offline. Check your connection to re-establish contact
        with HQ.
      </p>
      <Link href="/">
        <Button className="bg-tactical-red hover:bg-red-700 font-bold tracking-wider">
          RETRY CONNECTION
        </Button>
      </Link>
      </div>
    </div>
  );
}
