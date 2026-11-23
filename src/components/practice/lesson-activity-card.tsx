import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LessonProgress } from "@/lib/progress";

/** How often the Learner has marked this Lesson done, and when last. */
export default function LessonActivityCard({
  activity,
}: {
  activity: LessonProgress["activity"];
}) {
  const { shadowingAttemptCount, lastDoneAt } = activity;

  return (
    <Card className="h-fit shadow-sm lg:sticky lg:top-4">
      <CardHeader>
        <CardTitle className="text-base">Marked done</CardTitle>
        <CardDescription>
          {shadowingAttemptCount === 0 || !lastDoneAt
            ? "You haven't marked this Lesson done yet."
            : `${formatTimes(shadowingAttemptCount)} · last done ${formatDate(lastDoneAt)}`}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function formatTimes(count: number) {
  return count === 1 ? "1 time" : `${count} times`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}
