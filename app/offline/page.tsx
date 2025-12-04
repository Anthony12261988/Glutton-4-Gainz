import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-camo-black p-4 text-center">
      <WifiOff className="mb-6 h-24 w-24 text-steel/50" />
      <h1 className="font-heading text-4xl font-bold uppercase tracking-wider text-white mb-4">
        Comms Down
      </h1>
      <p className="text-steel mb-8 max-w-md">
        You are currently offline. Check your connection to re-establish contact with HQ.
      </p>
      <Link href="/">
        <Button className="bg-tactical-red hover:bg-red-700 font-bold tracking-wider">
          RETRY CONNECTION
        </Button>
      </Link>
    </div>
  );
}
