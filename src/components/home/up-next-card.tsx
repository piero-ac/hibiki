import Link from "next/link";
import { ArrowRight, Shuffle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CatalogueEntry } from "@/lib/lesson-catalogue";

const RANDOM_LESSON_HREF = "/protected/sentences/random";

function categoryLabel(category: string) {
  const words = category.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * The suggested New Lesson with Start, plus Start Random Lesson. With no
 * suggestion (every Lesson shadowed, or history unavailable), only the
 * random action is offered.
 */
export function UpNextCard({
  suggestion,
}: {
  suggestion: CatalogueEntry | null;
}) {
  const lesson = suggestion?.lesson;

  return (
    <Card className="relative gap-2.5 p-4.5 ring-0 md:max-w-190 md:gap-4 md:rounded-3xl md:px-8.5 md:py-7.5">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12.5 -bottom-15 size-37.5 rounded-full bg-accent-200 opacity-60 md:-right-15 md:-bottom-20 md:size-55"
      />

      <p className="relative text-label font-bold tracking-widest text-accent-700 uppercase md:text-xs">
        {lesson ? "Up next · New to you" : "Up next"}
      </p>

      {lesson ? (
        <>
          <div className="relative flex flex-col gap-1">
            <p
              lang="ja"
              className="line-clamp-2 font-japanese text-lead leading-normal font-bold md:line-clamp-none md:text-headline md:leading-[1.35]"
            >
              {lesson.sentence}
            </p>
            <p className="hidden text-body text-neutral-800 md:block">
              {lesson.translation}
            </p>
          </div>

          <div className="relative flex flex-wrap items-center gap-1.5">
            <Badge variant="accent">{lesson.jlptLevel}</Badge>
            {lesson.category && (
              <Badge variant="accent-2">{categoryLabel(lesson.category)}</Badge>
            )}
            <span className="ml-1 text-xs text-muted-foreground md:text-caption">
              7 Steps · about 5 min
            </span>
          </div>
        </>
      ) : (
        <p className="relative text-base text-neutral-800">
          Let Hibiki pick a Lesson for you.
        </p>
      )}

      <div className="relative grid grid-cols-[1fr_3.25rem] gap-2 md:flex md:gap-2.5">
        {lesson ? (
          <>
            <Button
              asChild
              shape="pill"
              className="h-13 text-base md:h-12 md:px-6"
            >
              <Link href={`/protected/sentences/${lesson.id}`}>
                Start
                <ArrowRight data-icon="inline-end" className="size-4.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              shape="pill"
              className="h-13 bg-background text-base md:h-12 md:bg-secondary md:px-5"
            >
              <Link
                href={RANDOM_LESSON_HREF}
                prefetch={false}
                aria-label="Start Random Lesson"
              >
                <Shuffle className="size-5 md:size-4.5" />
                <span className="hidden md:inline">Random Lesson</span>
              </Link>
            </Button>
          </>
        ) : (
          <Button
            asChild
            shape="pill"
            className="col-span-2 h-13 text-base md:h-12 md:px-6"
          >
            <Link href={RANDOM_LESSON_HREF} prefetch={false}>
              <Shuffle data-icon="inline-start" className="size-4.5" />
              Start Random Lesson
            </Link>
          </Button>
        )}
      </div>
    </Card>
  );
}
