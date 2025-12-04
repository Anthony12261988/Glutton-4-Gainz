import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="container max-w-md mx-auto py-24 px-4 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle className="h-24 w-24 text-radar-green animate-pulse" />
      </div>

      <h1 className="text-3xl font-black uppercase tracking-tight mb-4 text-white">
        Mission Accomplished
      </h1>

      <p className="text-steel mb-8">
        Payment successful. Your account has been upgraded to Soldier status.
        You now have full access to all tactical resources.
      </p>

      <div className="space-y-4">
        <Link href="/nutrition">
          <Button className="w-full bg-tactical-red hover:bg-red-700 font-bold tracking-wider">
            ACCESS MEAL PLANNER
          </Button>
        </Link>

        <Link href="/">
          <Button
            variant="ghost"
            className="w-full text-steel hover:text-white"
          >
            RETURN TO BASE
          </Button>
        </Link>
      </div>
    </div>
  );
}
