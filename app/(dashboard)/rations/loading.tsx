import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Weekly Calendar View */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="rounded-sm border border-steel/20 bg-gunmetal p-4 space-y-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-32 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>

        {/* Macros Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-sm border border-steel/20 bg-gunmetal p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
