import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-6 sm:px-6 lg:gap-6 lg:px-9 lg:py-8 [&_[data-slot=skeleton]]:bg-foreground/10">
      <div className="flex flex-wrap items-end gap-4">
        <div className="mr-auto flex flex-col gap-2">
          <Skeleton className="h-9 w-56 max-w-full lg:h-10" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3.5">
        <Skeleton className="h-10 w-full rounded-full lg:w-80" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-24 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-full sm:w-52 lg:ml-auto" />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="mx-1.5 mb-1 h-4 w-20" />
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-3xl p-3 sm:px-4.5 sm:py-3.5"
            >
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-10 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="ml-auto h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        <Skeleton className="hidden h-[480px] rounded-[36px] lg:block" />
      </div>
    </div>
  );
}
