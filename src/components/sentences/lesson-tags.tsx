import { Badge } from "@/components/ui/badge";
import { categoryLabel, type CatalogueLesson } from "@/lib/lesson-catalogue";

/**
 * A Lesson's JLPT Level and Category as tags; a missing one is left out.
 * `className` goes on each Badge.
 */
export function LessonTags({
  lesson,
  className,
}: {
  lesson: Pick<CatalogueLesson, "category"> & { jlptLevel: string | null };
  className?: string;
}) {
  return (
    <>
      {lesson.jlptLevel && (
        <Badge variant="accent" className={className}>
          {lesson.jlptLevel}
        </Badge>
      )}
      {lesson.category && (
        <Badge variant="accent-2" className={className}>
          {categoryLabel(lesson.category)}
        </Badge>
      )}
    </>
  );
}
