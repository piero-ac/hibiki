import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

const RECENT_SHADOWING_ATTEMPTS_LIMIT = 10;

type ProgressLesson = {
  id: string;
  sentence: string;
  jlptLevel: string;
  category: string | null;
};

export type ShadowingAttempt = {
  id: string;
  completedAt: Date;
  lesson: ProgressLesson;
};

/*
 * Progress is Activity only. Scores (from AI Grading Attempts) are hidden for
 * now, so nothing here queries AI grading; showing Scores again means adding
 * a `scores` part to these types.
 */

export type LearnerProgress = {
  /** From the Learner's Shadowing Attempts. */
  activity: {
    /** Every Shadowing Attempt, including repeats of the same Lesson. */
    lessonsCompleted: number;
    /** Distinct Lessons with at least one Shadowing Attempt. */
    lessonsPracticed: number;
    /** Distinct days with at least one Shadowing Attempt. */
    daysPracticed: number;
    recentShadowingAttempts: ShadowingAttempt[];
  };
};

export type LessonProgress = {
  /** From the Learner's Shadowing Attempts for this Lesson. */
  activity: {
    shadowingAttemptCount: number;
    lastDoneAt: Date | null;
  };
};

/** Progress for the Learner `supabase` is signed in as. */
export async function getLearnerProgress(
  supabase: Client,
): Promise<LearnerProgress> {
  const [summaryResult, recentResult] = await Promise.all([
    supabase.from("shadowing_activity_summary").select("*").single(),
    supabase
      .from("recent_shadowing_attempts")
      .select("*")
      .limit(RECENT_SHADOWING_ATTEMPTS_LIMIT),
  ]);

  const summary = unwrap(summaryResult);
  const recent = unwrap(recentResult);

  return {
    activity: {
      lessonsCompleted: summary.lessons_completed ?? 0,
      lessonsPracticed: summary.lessons_practiced ?? 0,
      daysPracticed: summary.days_practiced ?? 0,
      recentShadowingAttempts: recent.map((row) => ({
        id: required(row.id),
        completedAt: new Date(required(row.completed_at)),
        lesson: toProgressLesson(row),
      })),
    },
  };
}

/** One Lesson's Progress for the Learner `supabase` is signed in as. */
export async function getLessonProgress(
  supabase: Client,
  lessonId: string,
): Promise<LessonProgress> {
  // Row level security limits this to the signed-in Learner's attempts.
  const shadowingResult = await supabase
    .from("shadowing_attempts")
    .select("completed_at", { count: "exact" })
    .eq("sentence_id", lessonId)
    .order("completed_at", { ascending: false })
    .limit(1);

  const lastDone = unwrap(shadowingResult)[0];

  return {
    activity: {
      shadowingAttemptCount: shadowingResult.count ?? 0,
      lastDoneAt: lastDone ? new Date(lastDone.completed_at) : null,
    },
  };
}

/**
 * How many Shadowing Attempts the Learner `supabase` is signed in as has for
 * each Lesson, keyed by Lesson id. Lessons never marked done are absent.
 */
export async function getShadowingAttemptCounts(
  supabase: Client,
): Promise<Map<string, number>> {
  // Row level security limits this to the signed-in Learner's attempts.
  const rows = unwrap(
    await supabase.from("shadowing_attempts").select("sentence_id"),
  );

  const counts = new Map<string, number>();
  for (const { sentence_id } of rows) {
    counts.set(sentence_id, (counts.get(sentence_id) ?? 0) + 1);
  }
  return counts;
}

/** Marks a Lesson done for the Learner `supabase` is signed in as. */
export async function recordShadowingAttempt(
  supabase: Client,
  lessonId: string,
): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Only a signed-in Learner can Mark Done.", {
      cause: authError,
    });
  }

  const { error } = await supabase
    .from("shadowing_attempts")
    .insert({ user_id: user.id, sentence_id: lessonId });
  if (error) {
    throw new Error("Failed to record the Shadowing Attempt.", {
      cause: error,
    });
  }
}

function toProgressLesson(row: {
  sentence_id: string | null;
  japanese_text: string | null;
  jlpt_level: string | null;
  category: string | null;
}): ProgressLesson {
  return {
    id: required(row.sentence_id),
    sentence: required(row.japanese_text),
    jlptLevel: required(row.jlpt_level),
    category: row.category,
  };
}

function unwrap<T>(result: { data: T | null; error: unknown }): T {
  if (result.error || result.data === null) {
    throw new Error("Failed to load Progress.", { cause: result.error });
  }
  return result.data;
}

/**
 * Postgres reports every view column as nullable. These columns come from
 * NOT NULL table columns, so a null here means the view itself changed.
 */
function required<T>(value: T | null): T {
  if (value === null) {
    throw new Error("Progress view returned an unexpected null.");
  }
  return value;
}
