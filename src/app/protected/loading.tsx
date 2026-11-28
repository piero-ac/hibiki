import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 [&_[data-slot=skeleton]]:bg-foreground/10">
      <div className="space-y-8">
        <Card className="shadow-sm">
          <CardHeader className="space-y-4">
            <Skeleton className="h-6 w-36 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-64 max-w-full" />
              <Skeleton className="h-5 w-full max-w-2xl" />
              <Skeleton className="h-5 w-80 max-w-full" />
            </div>
          </CardHeader>

          <CardContent>
            <Skeleton className="h-11 w-64 max-w-full rounded-full" />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="flex flex-col shadow-sm">
              <CardHeader className="space-y-3">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </CardHeader>

              <CardFooter className="mt-auto">
                <Skeleton className="h-10 w-full rounded-full" />
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64 max-w-full" />
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
      </div>
    </div>
  );
}
