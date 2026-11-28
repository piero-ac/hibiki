import { EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Step } from "@/lib/lesson-player";

interface SentenceBlockProps {
  shows: Step["shows"];
  sentence: string;
  kana: string;
  translation: string;
}

/**
 * The Sentence, its kana reading and its translation, each on its own line
 * and only as far as the Step allows (ADR 0002). With nothing to show, the
 * Learner is told to shadow from the sound alone.
 */
export function SentenceBlock({
  shows,
  sentence,
  kana,
  translation,
}: SentenceBlockProps) {
  if (!shows.sentence && !shows.kana && !shows.translation) {
    return (
      <Card className="min-h-52 flex-1 items-center justify-center gap-2.5 rounded-2xl bg-accent-2-100 px-6 text-center text-sm text-accent-2-800 ring-0 md:min-h-0 md:flex-row md:justify-start md:gap-4 md:bg-transparent md:px-0 md:text-body md:text-neutral-700">
        <span className="grid size-13 place-items-center rounded-full md:bg-background md:text-accent-2-700">
          <EyeOff aria-hidden className="size-7 md:size-6" />
        </span>
        Eyes off the text. Speak along with the sound.
      </Card>
    );
  }

  return (
    <Card className="justify-center gap-2.5 rounded-2xl p-5 ring-0 md:flex-1 md:gap-3.5 md:bg-transparent md:p-0">
      {shows.sentence && (
        <p
          lang="ja"
          className="font-japanese text-[22px] leading-normal font-bold text-pretty md:max-w-5xl md:text-3xl"
        >
          {sentence}
        </p>
      )}
      {shows.kana && (
        <p
          lang="ja"
          className="font-japanese text-sm leading-relaxed font-medium text-pretty text-neutral-700 md:text-lead"
        >
          {kana}
        </p>
      )}
      {shows.translation && (
        <p className="text-sm leading-normal text-pretty text-neutral-800 md:max-w-3xl md:text-base">
          {translation}
        </p>
      )}
    </Card>
  );
}
