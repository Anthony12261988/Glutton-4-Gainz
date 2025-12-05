import { Suspense } from "react";
import { SignupForm } from "./signup-form";
import { Loader2 } from "lucide-react";

function SignupLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-tactical-red" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupForm />
    </Suspense>
  );
}
