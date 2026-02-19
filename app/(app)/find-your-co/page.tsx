import { getPublicCoaches } from "@/lib/queries/coaches";
import { FindYourCOClient } from "./find-your-co-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Find Your CO | Glutton4Gainz",
  description:
    "Discover Commanding Officers ready to lead your training. Browse available COs, filter by AO, and request a briefing.",
};

export default async function FindYourCOPage() {
  const coaches = await getPublicCoaches();

  return <FindYourCOClient initialCoaches={coaches} />;
}
