import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the Home layout: greeting, Up next card, Lessons by level.
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3.5 px-4 pt-2 pb-6 md:gap-7 md:px-9 md:pt-8 md:pb-10 [&_[data-slot=skeleton]]:bg-foreground/10">
      <Skeleton className="mx-1 mt-1 h-9 w-40 md:mx-0 md:h-11 md:w-56" />

      <Card className="gap-2.5 p-4.5 ring-0 md:max-w-190 md:gap-4 md:rounded-[36px] md:px-8.5 md:py-7.5">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-6 w-full md:h-9" />
        <Skeleton className="h-6 w-3/4 md:h-5 md:w-1/2" />
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-10 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-[1fr_3.25rem] gap-2 md:flex md:gap-2.5">
          <Skeleton className="h-13 rounded-full md:h-12 md:w-28" />
          <Skeleton className="h-13 rounded-full md:h-12 md:w-40" />
        </div>
      </Card>

      <div className="flex flex-col gap-3 md:gap-3.5">
        <Skeleton className="mx-1 h-6 w-44 md:mx-0 md:h-7" />

        <div className="flex flex-col md:hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex min-h-13 items-center gap-3.5 px-1"
            >
              <Skeleton className="h-5 w-10" />
              <Skeleton className="h-2.5 flex-1 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>

        <div className="hidden grid-cols-5 gap-3.5 md:grid">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
