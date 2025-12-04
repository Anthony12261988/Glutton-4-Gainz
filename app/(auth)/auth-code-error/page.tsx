import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gunmetal p-4">
      <Card className="w-full max-w-md border-tactical-red/20">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-tactical-red/10 p-3">
              <AlertCircle className="h-8 w-8 text-tactical-red" />
            </div>
          </div>
          <CardTitle className="text-2xl font-oswald uppercase tracking-wide">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-steel">
            There was a problem signing you in
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-gunmetal-light rounded-sm p-4 border border-steel/20">
            <p className="text-sm text-steel leading-relaxed">
              We couldn't complete your sign-in request. This could be due to:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-steel/80">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>An expired or invalid authentication link</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>The link has already been used</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>A temporary connection issue</span>
              </li>
            </ul>
          </div>

          <div className="bg-tactical-red/5 border border-tactical-red/20 rounded-sm p-3">
            <p className="text-xs text-tactical-red font-medium uppercase tracking-wide">
              TACTICAL RECOMMENDATION
            </p>
            <p className="text-sm text-steel mt-1">
              Return to the login page and try again. If the problem persists,
              request a new authentication link.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full" size="lg">
            <Link href="/login">
              <RefreshCw className="mr-2 h-4 w-4" />
              TRY AGAIN
            </Link>
          </Button>

          <Button asChild variant="ghost" className="w-full" size="lg">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              RETURN TO HOME
            </Link>
          </Button>
        </CardFooter>

        <div className="px-6 pb-6">
          <p className="text-xs text-center text-steel/60">
            Need help?{" "}
            <Link
              href="mailto:support@glutton4games.com"
              className="text-tactical-red hover:underline"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
