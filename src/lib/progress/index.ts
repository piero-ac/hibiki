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
        lesson: toProgressLesson(row),
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

/** Both AI grading progress views carry the same Lesson columns. */
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
