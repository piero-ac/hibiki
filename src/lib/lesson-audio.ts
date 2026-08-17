import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const LESSON_AUDIO_BUCKET = "lesson-audio";
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60;

export async function createLessonAudioUrl(
  supabase: SupabaseClient<Database>,
  objectPath: string | null,
): Promise<string | null> {
  if (!objectPath) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(LESSON_AUDIO_BUCKET)
    .createSignedUrl(objectPath, SIGNED_URL_EXPIRES_IN_SECONDS);

  if (error) {
    throw new Error("Failed to create a signed lesson audio URL.", {
      cause: error,
    });
  }

  return data.signedUrl;
}
