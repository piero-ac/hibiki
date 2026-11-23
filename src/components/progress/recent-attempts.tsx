import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpenIcon } from "@phosphor-icons/react/dist/ssr";
import { EmptyState } from "@/components/app/empty-state";
import type { GradedAttempt } from "@/lib/progress";

export default function RecentAttempts({
  attempts,
}: {
  attempts: GradedAttempt[];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Recent Attempts
        </h2>
        <p className="text-sm text-muted-foreground">
          Your latest pronunciation practice sessions.
        </p>
      </div>

      {attempts.length === 0 ? (
        <EmptyState
          icon={<BookOpenIcon className="h-10 w-10" />}
          title="No attempts yet"
          description="Complete your first shadowing exercise to start tracking your progress."
        />
      ) : (
        <div className="max-w-4xl space-y-4">
          {attempts.map((attempt) => (
            <Card key={attempt.id}>
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-3xl font-bold tracking-tight text-emerald-300 sm:text-4xl">
                    {attempt.accuracyScore}%
                  </p>

                  <span className="text-xs text-muted-foreground">
                    {attempt.gradedAt.toLocaleDateString()}
                  </span>
                </div>

                <p className="mt-5 text-lg font-semibold leading-relaxed sm:text-xl">
                  {attempt.lesson.sentence}
                </p>

                <Separator className="my-5" />

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Whisper transcription
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {attempt.transcript ?? "No transcript available."}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
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
