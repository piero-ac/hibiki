export type CatalogueLesson = {
  id: string;
  sentence: string;
  kana: string;
  translation: string;
  jlptLevel: string;
  category: string | null;
};

/** A `sentences` row, as selected from the database. */
type SentenceRow = {
  id: string;
  japanese_text: string;
  kana_text: string;
  english_translation: string;
  jlpt_level: string;
  category: string | null;
};

export function toCatalogueLesson(row: SentenceRow): CatalogueLesson {
  return {
    id: row.id,
    sentence: row.japanese_text,
    kana: row.kana_text,
    translation: row.english_translation,
    jlptLevel: row.jlpt_level,
    category: row.category,
  };
}

/**
 * How much the Learner has practised a Lesson, from Shadowing Attempts only
 * (see GLOSSARY). AI Grading Attempts never affect it.
 */
export type LessonStatus = "new" | "shadowed" | "shadowed-3-plus";

export const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
  new: "New",
  shadowed: "Shadowed",
  "shadowed-3-plus": "Shadowed 3×+",
};

export type CatalogueEntry = {
  lesson: CatalogueLesson;
  /** Null when the Shadowing Attempt counts couldn't be loaded. */
  status: LessonStatus | null;
  /** Null when the Shadowing Attempt counts couldn't be loaded. */
  shadowingAttemptCount: number | null;
};

/**
 * Each Lesson with its Lesson Status. Pass the counts from
 * `getShadowingAttemptCounts`, or null if they failed to load: the Lessons
 * still list, with an unknown status.
 */
export function buildCatalogue(
  lessons: readonly CatalogueLesson[],
  shadowingAttemptCounts: ReadonlyMap<string, number> | null,
): CatalogueEntry[] {
  return lessons.map((lesson) => {
    if (!shadowingAttemptCounts) {
      return { lesson, status: null, shadowingAttemptCount: null };
    }
    const count = shadowingAttemptCounts.get(lesson.id) ?? 0;
    return {
      lesson,
      status: toLessonStatus(count),
      shadowingAttemptCount: count,
    };
  });
}

const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

type JlptLevel = (typeof JLPT_LEVELS)[number];

export type JlptLevelGroup = {
  jlptLevel: JlptLevel;
  entries: CatalogueEntry[];
};

/**
 * The catalogue grouped by JLPT Level, from N5 to N1. Levels with no Lessons
 * are left out; each group keeps the catalogue's order.
 */
export function groupByJlptLevel(
  catalogue: readonly CatalogueEntry[],
): JlptLevelGroup[] {
  return JLPT_LEVELS.map((jlptLevel) => ({
    jlptLevel,
    entries: catalogue.filter((entry) => entry.lesson.jlptLevel === jlptLevel),
  })).filter((group) => group.entries.length > 0);
}

/** "all" turns a filter off. */
export type CatalogueFilters = {
  jlptLevel: JlptLevel | "all";
  category: string | "all";
  status: LessonStatus | "all";
};

export type FilteredCatalogue = {
  entries: CatalogueEntry[];
  /** How many Lessons match; 0 when none do. */
  count: number;
};

/**
 * The Lessons matching every filter given. Filters left out default to
 * "all".
 */
export function filterCatalogue(
  catalogue: readonly CatalogueEntry[],
  filters: Partial<CatalogueFilters> = {},
): FilteredCatalogue {
  const { jlptLevel = "all", category = "all", status = "all" } = filters;
  const entries = catalogue.filter(
    (entry) =>
      (jlptLevel === "all" || entry.lesson.jlptLevel === jlptLevel) &&
      (category === "all" || entry.lesson.category === category) &&
      // An unknown status matches only "all".
      (status === "all" || entry.status === status),
  );
  return { entries, count: entries.length };
}

function toLessonStatus(count: number): LessonStatus {
  if (count >= 3) return "shadowed-3-plus";
  return count === 0 ? "new" : "shadowed";
}
