import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LESSONS_HREF, LessonExit } from "./lesson-exit";

const RANDOM_LESSON_HREF = "/protected/sentences/random";

/** Shown once Mark Done has saved a Shadowing Attempt. */
export function LessonShadowed({
  shadowingAttemptCount,
  onShadowAgain,
}: {
  /** Including the one just saved; null if the count couldn't be loaded. */
  shadowingAttemptCount: number | null;
  onShadowAgain: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-5 md:max-w-160 md:justify-center md:gap-6">
      <span className="grid size-22 place-items-center rounded-full bg-accent-2-500 text-primary-foreground ring-10 ring-accent-2-200 md:size-26 md:ring-12">
        <Check aria-hidden className="size-10 md:size-12" />
      </span>
      <div className="flex flex-col gap-1.5">
        <p
          lang="ja"
          className="font-japanese text-lg font-bold text-accent-700 md:text-xl"
        >
          お疲れさま！
        </p>
        <h1 className="text-3xl md:text-4xl">Lesson shadowed</h1>
        <p className="text-[15px] text-neutral-800 md:text-base">
          All seven Steps done.
          {shadowingAttemptCount !== null &&
            ` That's your ${ordinal(shadowingAttemptCount)} Shadowing Attempt on this Lesson.`}
        </p>
      </div>
      <div className="mt-auto flex flex-col gap-2 md:mt-0 md:flex-row md:flex-wrap md:gap-2.5">
        <LessonExit
          href={RANDOM_LESSON_HREF}
          shape="pill"
          size="lg"
          className="h-13 text-base md:px-6"
        >
          Next Lesson
          <ArrowRight aria-hidden />
        </LessonExit>
        <Button
          onClick={onShadowAgain}
          variant="secondary"
          shape="pill"
          size="lg"
          className="h-12 text-base md:h-13 md:px-6"
        >
          Shadow again
        </Button>
        <LessonExit
          href={LESSONS_HREF}
          variant="ghost"
          shape="pill"
          size="lg"
          className="h-12 text-base md:h-13"
        >
          Back to Lessons
        </LessonExit>
      </div>
    </div>
  );
}

function ordinal(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  const suffix = suffixes[n % 10] ?? "th";
  return `${n}${suffix}`;
}
