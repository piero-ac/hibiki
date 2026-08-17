import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { createLessonAudioUrl } from "@/lib/lesson-audio";
import type { Database } from "@/types/database.types";

function createMockSupabase() {
  const createSignedUrl = vi.fn();
  const from = vi.fn(() => ({ createSignedUrl }));
  const supabase = {
    storage: { from },
  } as unknown as SupabaseClient<Database>;

  return { createSignedUrl, from, supabase };
}

describe("createLessonAudioUrl", () => {
  it("creates a one-hour signed URL for a private object path", async () => {
    const { createSignedUrl, from, supabase } = createMockSupabase();
    createSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://example.test/signed/natural.mp3" },
      error: null,
    });

    await expect(
      createLessonAudioUrl(
        supabase,
        "sentences/caught-in-rain-no-umbrella/natural.mp3",
      ),
    ).resolves.toBe("https://example.test/signed/natural.mp3");
    expect(from).toHaveBeenCalledWith("lesson-audio");
    expect(createSignedUrl).toHaveBeenCalledWith(
      "sentences/caught-in-rain-no-umbrella/natural.mp3",
      3600,
    );
  });

  it("preserves a legacy public URL without calling Storage", async () => {
    const { from, supabase } = createMockSupabase();
    const publicUrl =
      "https://example.supabase.co/storage/v1/object/public/audio/prompt.mp3";

    await expect(createLessonAudioUrl(supabase, publicUrl)).resolves.toBe(
      publicUrl,
    );
    expect(from).not.toHaveBeenCalled();
  });

  it("returns null for a missing optional audio path", async () => {
    const { from, supabase } = createMockSupabase();

    await expect(createLessonAudioUrl(supabase, null)).resolves.toBeNull();
    expect(from).not.toHaveBeenCalled();
  });

  it("throws a stable error when Storage cannot sign the object", async () => {
    const { createSignedUrl, supabase } = createMockSupabase();
    createSignedUrl.mockResolvedValue({
      data: null,
      error: new Error("Object not found"),
    });

    await expect(
      createLessonAudioUrl(supabase, "sentences/missing/natural.mp3"),
    ).rejects.toThrow("Failed to create a signed lesson audio URL.");
  });
});
