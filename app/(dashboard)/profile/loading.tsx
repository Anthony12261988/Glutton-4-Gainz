import { ProfileSkeleton } from "@/components/loading/profile-skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <ProfileSkeleton />
    </div>
  );
}
