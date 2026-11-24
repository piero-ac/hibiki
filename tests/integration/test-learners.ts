import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { inject } from "vitest";
import type { Database } from "@/types/database.types";

const PASSWORD = "HibikiIntegrationTest123!";

type Client = SupabaseClient<Database>;

export type TestLearner = {
  id: string;
  /** A Supabase client signed in as this Learner, like the app's server client. */
  client: Client;
};

const clientOptions = {
  auth: { autoRefreshToken: false, persistSession: false },
} as const;

function adminClient(): Client {
  return createClient<Database>(
    inject("supabaseUrl"),
    inject("supabaseServiceRoleKey"),
    clientOptions,
  );
}

const createdLearnerIds: string[] = [];

/**
 * Seeds a brand new Learner in local Supabase and signs in as them.
 * Call `deleteTestLearners()` in `afterAll` to remove them again.
 */
export async function createTestLearner(): Promise<TestLearner> {
  const email = `progress-${randomUUID()}@hibiki.test`;
  const admin = adminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  createdLearnerIds.push(data.user.id);

  const client = createClient<Database>(
    inject("supabaseUrl"),
    inject("supabasePublishableKey"),
    clientOptions,
  );
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password: PASSWORD,
  });
  if (signInError) throw signInError;

  return { id: data.user.id, client };
}

export async function deleteTestLearners() {
  const admin = adminClient();
  await Promise.all(
    createdLearnerIds
      .splice(0)
      .map((id) => admin.auth.admin.deleteUser(id).then(({ error }) => error)),
  ).then((errors) => {
    const error = errors.find(Boolean);
    if (error) throw error;
  });
}

/** The seeded Lessons, oldest first. */
export async function getSeededLessons() {
  const { data, error } = await adminClient()
    .from("sentences")
    .select("id, japanese_text, jlpt_level, category")
    .order("created_at")
    .order("id");
  if (error) throw error;
  if (data.length < 3) {
    throw new Error(
      "Integration tests need the seeded Lessons. Run `npx supabase db reset --local`.",
    );
  }
  return data;
}

/** Inserts AI Grading Attempts directly, as the grading pipeline would. */
export async function seedAiGradingAttempts(
  learner: TestLearner,
  attempts: {
    lessonId: string;
    accuracyScore: number;
    transcript?: string;
    createdAt: string;
  }[],
) {
  const { error } = await adminClient()
    .from("ai_grading_attempts")
    .insert(
      attempts.map((attempt) => ({
        user_id: learner.id,
        sentence_id: attempt.lessonId,
        accuracy_score: attempt.accuracyScore,
        user_audio_transcript: attempt.transcript ?? null,
        created_at: attempt.createdAt,
      })),
    );
  if (error) throw error;
}

/** Inserts Shadowing Attempts directly, so tests can pick when they happened. */
export async function seedShadowingAttempts(
  learner: TestLearner,
  attempts: { lessonId: string; completedAt: string }[],
) {
  const { error } = await adminClient()
    .from("shadowing_attempts")
    .insert(
      attempts.map((attempt) => ({
        user_id: learner.id,
        sentence_id: attempt.lessonId,
        completed_at: attempt.completedAt,
      })),
    );
  if (error) throw error;
}
