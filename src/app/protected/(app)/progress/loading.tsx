import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 [&_[data-slot=skeleton]]:bg-foreground/10">
      <div className="space-y-8 sm:space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>

        {/* Progress Overview */}
        <div className="space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="shadow-sm">
                <CardHeader className="flex items-center gap-2">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>

          <div className="max-w-4xl space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="shadow-sm">
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <Skeleton className="h-7 w-full max-w-md" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-10 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
