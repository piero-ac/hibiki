import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

const RECENT_SHADOWING_ATTEMPTS_LIMIT = 10;
const RECENT_GRADED_ATTEMPTS_LIMIT = 10;
const RANKED_LESSONS_LIMIT = 5;
const LESSON_RECENT_GRADED_ATTEMPTS_LIMIT = 5;
/** Strongest and weakest only mean something once there's a comparison. */
const MIN_GRADED_LESSONS_FOR_RANKING = 2;

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

type GradedAttempt = {
  id: string;
  accuracyScore: number;
  transcript: string | null;
  gradedAt: Date;
  lesson: ProgressLesson;
};

type LessonScore = {
  lesson: ProgressLesson;
  averageAccuracyScore: number;
  attemptCount: number;
};

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
  /** Null when the Learner has no AI Grading Attempts. */
  scores: {
    averageAccuracyScore: number;
    recentGradedAttempts: GradedAttempt[];
    /** Null until at least two Lessons have been graded. */
    lessonRanking: {
      strongest: LessonScore[];
      weakest: LessonScore[];
    } | null;
  } | null;
};

export type LessonProgress = {
  /** From the Learner's Shadowing Attempts for this Lesson. */
  activity: {
    shadowingAttemptCount: number;
    lastDoneAt: Date | null;
  };
  /** Null when the Learner has no AI Grading Attempts for this Lesson. */
  scores: {
    recentGradedAttempts: Pick<
      GradedAttempt,
      "id" | "accuracyScore" | "gradedAt"
    >[];
  } | null;
};

/** Progress for the Learner `supabase` is signed in as. */
export async function getLearnerProgress(
  supabase: Client,
): Promise<LearnerProgress> {
  const [activity, scores] = await Promise.all([
    getActivity(supabase),
    getScores(supabase),
  ]);
  return { activity, scores };
}

async function getActivity(
  supabase: Client,
): Promise<LearnerProgress["activity"]> {
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
    lessonsCompleted: summary.lessons_completed ?? 0,
    lessonsPracticed: summary.lessons_practiced ?? 0,
    daysPracticed: summary.days_practiced ?? 0,
    recentShadowingAttempts: recent.map((row) => ({
      id: required(row.id),
      completedAt: new Date(required(row.completed_at)),
      lesson: toProgressLesson(row),
    })),
  };
}

async function getScores(supabase: Client): Promise<LearnerProgress["scores"]> {
  const [summaryResult, recentResult] = await Promise.all([
    supabase.from("ai_grading_attempts_summary").select("*").single(),
    supabase
      .from("recent_ai_grading_attempts")
      .select("*")
      .limit(RECENT_GRADED_ATTEMPTS_LIMIT),
  ]);

  const summary = unwrap(summaryResult);
  const recent = unwrap(recentResult);

  if (!summary.total_attempts || summary.average_score === null) {
    return null;
  }

  const lessonRanking =
    (summary.sentences_practiced ?? 0) >= MIN_GRADED_LESSONS_FOR_RANKING
      ? await getLessonRanking(supabase)
      : null;

  return {
    averageAccuracyScore: summary.average_score,
    recentGradedAttempts: recent.map((row) => ({
      id: required(row.id),
      accuracyScore: required(row.accuracy_score),
      transcript: row.user_audio_transcript,
      gradedAt: new Date(required(row.created_at)),
      lesson: toProgressLesson(row),
    })),
    lessonRanking,
  };
}

async function getLessonRanking(supabase: Client) {
  const rankedBy = (ascending: boolean) =>
    supabase
      .from("ai_grading_sentence_progress")
      .select("*")
      .order("average_score", { ascending })
      .limit(RANKED_LESSONS_LIMIT);

  const [strongest, weakest] = (
    await Promise.all([rankedBy(false), rankedBy(true)])
  ).map((result) =>
    unwrap(result).map((row): LessonScore => ({
      lesson: toProgressLesson(row),
      averageAccuracyScore: required(row.average_score),
      attemptCount: required(row.attempt_count),
    })),
  );

  return { strongest, weakest };
}

/** One Lesson's Progress for the Learner `supabase` is signed in as. */
export async function getLessonProgress(
  supabase: Client,
  lessonId: string,
): Promise<LessonProgress> {
  // Row level security limits both queries to the signed-in Learner's attempts.
  const [shadowingResult, gradedResult] = await Promise.all([
    supabase
      .from("shadowing_attempts")
      .select("completed_at", { count: "exact" })
      .eq("sentence_id", lessonId)
      .order("completed_at", { ascending: false })
      .limit(1),
    supabase
      .from("ai_grading_attempts")
      .select("id, accuracy_score, created_at")
      .eq("sentence_id", lessonId)
      .order("created_at", { ascending: false })
      .limit(LESSON_RECENT_GRADED_ATTEMPTS_LIMIT),
  ]);

  const lastDone = unwrap(shadowingResult)[0];
  const graded = unwrap(gradedResult);

  return {
    activity: {
      shadowingAttemptCount: shadowingResult.count ?? 0,
      lastDoneAt: lastDone ? new Date(lastDone.completed_at) : null,
    },
    scores:
      graded.length === 0
        ? null
        : {
            recentGradedAttempts: graded.map((attempt) => ({
              id: attempt.id,
              accuracyScore: attempt.accuracy_score,
              gradedAt: new Date(attempt.created_at),
            })),
          },
  };
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

/** Every Progress view that lists Lessons carries the same Lesson columns. */
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
