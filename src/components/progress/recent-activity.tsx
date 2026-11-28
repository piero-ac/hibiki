import { Card, CardContent } from "@/components/ui/card";
import { LessonTags } from "@/components/sentences/lesson-tags";
import NoActivityYet from "@/components/progress/no-activity-yet";
import type { ShadowingAttempt } from "@/lib/progress";

/** The Learner's latest Shadowing Attempts. */
export default function RecentActivity({
  attempts,
}: {
  attempts: ShadowingAttempt[];
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1 sm:space-y-2">
        <h2 className="text-xl sm:text-2xl">Recent activity</h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          The Lessons you&apos;ve marked done most recently.
        </p>
      </div>

      {attempts.length === 0 ? (
        <NoActivityYet />
      ) : (
        <div className="max-w-4xl space-y-3">
          {attempts.map((attempt) => (
            <Card key={attempt.id} className="shadow-sm">
              <CardContent>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="font-japanese text-lg leading-relaxed font-medium sm:text-xl">
                    {attempt.lesson.sentence}
                  </p>

                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(attempt.completedAt)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <LessonTags lesson={attempt.lesson} />
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
