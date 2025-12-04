import { redirect } from "next/navigation";

export default function Home() {
  // The dashboard is the mission hub. Redirect root to keep UX consistent.
  redirect("/dashboard");
}
