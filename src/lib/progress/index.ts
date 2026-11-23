import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

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

export type GradedAttempt = {
  id: string;
  accuracyScore: number;
  transcript: string | null;
  gradedAt: Date;
  lesson: ProgressLesson;
};

export type LessonScore = {
  lesson: ProgressLesson;
  averageAccuracyScore: number;
  attemptCount: number;
};

export type LearnerProgress = {
  activity: {
    totalAttempts: number;
    lessonsPracticed: number;
    daysPracticed: number;
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
  activity: {
    attemptCount: number;
    lastAttemptedAt: Date | null;
  };
  /** Null when the Learner has no AI Grading Attempts for this Lesson. */
  scores: {
    recentGradedAttempts: {
      id: string;
      accuracyScore: number;
      gradedAt: Date;
    }[];
  } | null;
};

/** Progress for the Learner `supabase` is signed in as. */
export async function getLearnerProgress(
  supabase: Client,
): Promise<LearnerProgress> {
  const [summaryResult, recentResult] = await Promise.all([
    supabase.from("ai_grading_attempts_summary").select("*").single(),
    supabase
      .from("recent_ai_grading_attempts")
      .select("*")
      .limit(RECENT_GRADED_ATTEMPTS_LIMIT),
  ]);

  const summary = unwrap(summaryResult);
  const recent = unwrap(recentResult);

  const activity = {
    totalAttempts: summary.total_attempts ?? 0,
    lessonsPracticed: summary.sentences_practiced ?? 0,
    daysPracticed: summary.days_practiced ?? 0,
  };

  if (activity.totalAttempts === 0 || summary.average_score === null) {
    return { activity, scores: null };
  }

  const lessonRanking =
    activity.lessonsPracticed >= MIN_GRADED_LESSONS_FOR_RANKING
      ? await getLessonRanking(supabase)
      : null;

  return {
    activity,
    scores: {
      averageAccuracyScore: summary.average_score,
      recentGradedAttempts: recent.map((row) => ({
        id: required(row.id),
        accuracyScore: required(row.accuracy_score),
        transcript: row.user_audio_transcript,
        gradedAt: new Date(required(row.created_at)),
        lesson: {
          id: required(row.sentence_id),
          sentence: required(row.japanese_text),
          jlptLevel: required(row.jlpt_level),
          category: row.category,
        },
      })),
      lessonRanking,
    },
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
      lesson: {
        id: required(row.sentence_id),
        sentence: required(row.japanese_text),
        jlptLevel: required(row.jlpt_level),
        category: row.category,
      },
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
  // Row level security limits this to the signed-in Learner's attempts.
  const result = await supabase
    .from("ai_grading_attempts")
    .select("id, accuracy_score, created_at", { count: "exact" })
    .eq("sentence_id", lessonId)
    .order("created_at", { ascending: false })
    .limit(LESSON_RECENT_GRADED_ATTEMPTS_LIMIT);

  const attempts = unwrap(result);
  const latest = attempts[0];

  return {
    activity: {
      attemptCount: result.count ?? 0,
      lastAttemptedAt: latest ? new Date(latest.created_at) : null,
    },
    scores:
      attempts.length === 0
        ? null
        : {
            recentGradedAttempts: attempts.map((attempt) => ({
              id: attempt.id,
              accuracyScore: attempt.accuracy_score,
              gradedAt: new Date(attempt.created_at),
            })),
          },
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
