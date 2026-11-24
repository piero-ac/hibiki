import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpenIcon } from "@phosphor-icons/react/dist/ssr";
import { EmptyState } from "@/components/app/empty-state";
import type { ShadowingAttempt } from "@/lib/progress";

/** The Learner's latest Shadowing Attempts. */
export default function RecentActivity({
  attempts,
}: {
  attempts: ShadowingAttempt[];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Recent activity
        </h2>
        <p className="text-sm text-muted-foreground">
          The Lessons you&apos;ve marked done most recently.
        </p>
      </div>

      {attempts.length === 0 ? (
        <EmptyState
          icon={<BookOpenIcon className="h-10 w-10" />}
          title="No Lessons completed yet"
          description="Work through a Lesson and press Mark Done in the Final Recording step. Your practice will show up here."
        />
      ) : (
        <div className="max-w-4xl space-y-3">
          {attempts.map((attempt) => (
            <Card key={attempt.id}>
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-lg font-semibold leading-relaxed sm:text-xl">
                    {attempt.lesson.sentence}
                  </p>

                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(attempt.completedAt)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">{attempt.lesson.jlptLevel}</Badge>
                  <Badge variant="secondary">
                    {attempt.lesson.category ?? "General"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
