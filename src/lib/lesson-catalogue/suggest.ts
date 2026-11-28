import { groupByJlptLevel, type CatalogueEntry } from "@/lib/lesson-catalogue";

/**
 * The Lesson Home suggests next: the first New Lesson, from the easiest JLPT
 * Level (N5) up. Null when every Lesson has been shadowed, or when the
 * Shadowing Attempt counts couldn't be loaded (no Lesson is known to be New).
 */
export function suggestNewLesson(
  catalogue: readonly CatalogueEntry[],
): CatalogueEntry | null {
  for (const group of groupByJlptLevel(catalogue)) {
    const entry = group.entries.find((entry) => entry.status === "new");
    if (entry) return entry;
  }
  return null;
}
