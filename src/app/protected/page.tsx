import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getShadowingAttemptCounts } from "@/lib/progress";
import {
  buildCatalogue,
  groupByJlptLevel,
  toCatalogueLesson,
} from "@/lib/lesson-catalogue";
import { suggestNewLesson } from "@/lib/lesson-catalogue/suggest";
import { UpNextCard } from "@/components/home/up-next-card";
import { LessonStatusGrid } from "@/components/home/lesson-status-grid";

export default async function Home() {
  const supabase = await createClient();

  const { data: claims, error: authError } = await supabase.auth.getClaims();

  if (authError || !claims?.claims) {
    redirect("/auth/login");
  }

  const { data: sentences, error: sentencesError } = await supabase
    .from("sentences")
    .select(
      "id, japanese_text, kana_text, english_translation, jlpt_level, category",
    )
    // groupByJlptLevel orders the levels N5 to N1.
    .order("category", { ascending: true })
    .order("id", { ascending: true });

  // Without the counts the Lessons still list, just without status colours.
  let shadowingAttemptCounts: Map<string, number> | null;
  try {
    shadowingAttemptCounts = await getShadowingAttemptCounts(supabase);
  } catch {
    shadowingAttemptCounts = null;
  }

  const catalogue = buildCatalogue(
    (sentences ?? []).map(toCatalogueLesson),
    shadowingAttemptCounts,
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3.5 px-4 pt-2 pb-6 md:gap-7 md:px-9 md:pt-8 md:pb-10">
      <h1 lang="ja" className="mx-1 mt-1 text-[1.75rem] md:mx-0 md:text-[38px]">
        おかえり。
      </h1>

      <UpNextCard suggestion={suggestNewLesson(catalogue)} />

      {sentencesError ? (
        <p className="px-1 text-sm text-muted-foreground">
          Lessons couldn&apos;t be loaded. Try refreshing the page.
        </p>
      ) : (
        <LessonStatusGrid groups={groupByJlptLevel(catalogue)} />
      )}
    </div>
  );
}
