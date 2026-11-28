import Link from "next/link";
import { LessonPlayer } from "@/components/lesson-player/lesson-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { createLessonAudioUrl } from "@/lib/lesson-audio";
import { getLessonProgress } from "@/lib/progress";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShadowingPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: sentence, error } = await supabase
    .from("sentences")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !sentence) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Lesson not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" shape="pill">
              <Link href="/protected/sentences">Back to Lessons</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [naturalAudioUrl, slowAudioUrl] = await Promise.all([
    createLessonAudioUrl(supabase, sentence.audio_prompt_url),
    createLessonAudioUrl(supabase, sentence.slow_audio_prompt_url),
  ]);

  // The attempt count is secondary: if it fails, the Lesson stays practicable.
  const lessonProgress = await getLessonProgress(supabase, sentence.id).catch(
    () => null,
  );

  return (
    <div className="flex flex-1 flex-col">
      <LessonPlayer
        key={sentence.id}
        lesson={{
          id: sentence.id,
          sentence: sentence.japanese_text,
          kana: sentence.kana_text,
          translation: sentence.english_translation,
          jlptLevel: sentence.jlpt_level,
          category: sentence.category,
        }}
        naturalAudioUrl={naturalAudioUrl}
        slowAudioUrl={slowAudioUrl}
        shadowingAttemptCount={
          lessonProgress?.activity.shadowingAttemptCount ?? null
        }
      />
    </div>
  );
}
