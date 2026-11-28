import { TriangleAlert } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { LessonPicker } from "@/components/sentences/lesson-picker";
import { createClient } from "@/lib/supabase/server";
import { getShadowingAttemptCounts } from "@/lib/progress";
import { buildCatalogue, toCatalogueLesson } from "@/lib/lesson-catalogue";

export default async function Lessons() {
  const supabase = await createClient();

  const { data: sentences, error: sentencesError } = await supabase
    .from("sentences")
    .select(
      "id, japanese_text, kana_text, english_translation, jlpt_level, category",
    )
    .order("jlpt_level", { ascending: true })
    .order("category", { ascending: true });

  if (sentencesError) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:px-9">
        <Empty className="border border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TriangleAlert />
            </EmptyMedia>
            <EmptyTitle>Lessons couldn&apos;t be loaded</EmptyTitle>
            <EmptyDescription>
              Something went wrong loading the Lessons. Try again in a moment.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  let shadowingAttemptCounts: Map<string, number> | null;
  try {
    shadowingAttemptCounts = await getShadowingAttemptCounts(supabase);
  } catch {
    shadowingAttemptCounts = null;
  }

  return (
    <LessonPicker
      catalogue={buildCatalogue(
        sentences.map(toCatalogueLesson),
        shadowingAttemptCounts,
      )}
      statusesAvailable={shadowingAttemptCounts !== null}
    />
  );
}
