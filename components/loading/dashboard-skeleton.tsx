import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-24">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Mission Card Skeleton */}
      <div className="space-y-4">
        <div className="rounded-sm border border-steel/20 bg-gunmetal p-6 space-y-4">
          {/* Title */}
          <Skeleton className="h-6 w-3/4" />

          {/* Description */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />

          {/* Video Placeholder */}
          <Skeleton className="h-48 w-full" />

          {/* Exercises */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>

        {/* Complete Button */}
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
