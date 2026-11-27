"use client";

import { useMemo, useState } from "react";
import {
  checkPronunciation,
  markLessonDone,
} from "@/app/protected/sentences/actions";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createBrowserLessonMedia,
  getStep,
  STEP_COUNT,
  useLessonPlayer,
  type GradeRecording,
  type Step,
  type StepNumber,
} from "@/lib/lesson-player";
import { cn } from "@/lib/utils";

/**
 * AI grading is switched off while the app focuses on shadowing itself.
 * Set to true to bring back Submit Attempt for signed-up Learners.
 */
const AI_GRADING_ENABLED = false;

const STEP_TITLES: Record<Step["type"], string> = {
  listen: "Listen",
  shadowWithTranscript: "Shadow with Transcript",
  shadowWithoutTranscript: "Shadow without Transcript",
  finalRecording: "Final Recording",
};

const STEP_INSTRUCTIONS: Record<Step["type"], string> = {
  listen: "Listen to the Native Audio while reading along.",
  shadowWithTranscript:
    "Speak along with the Native Audio while reading the Sentence and its kana. Nothing is recorded.",
  shadowWithoutTranscript:
    "Speak along with the Native Audio from memory. Nothing is recorded.",
  finalRecording:
    "Record yourself shadowing the Natural Native Audio, then compare.",
};

interface ShadowingPlayerProps {
  naturalAudioUrl: string;
  slowAudioUrl: string;
  sentenceId: string;
  japaneseText: string;
  kanaText: string;
  englishTranslation: string;
}

export default function SimpleShadowingPlayer({
  naturalAudioUrl,
  slowAudioUrl,
  sentenceId,
  japaneseText,
  kanaText,
  englishTranslation,
}: ShadowingPlayerProps) {
  // One adapter per Lesson: recreating it would revoke the current Recording.
  // The page keys this component by Lesson, so new props mean a new mount.
  const [media] = useState(() =>
    createBrowserLessonMedia({
      naturalUrl: naturalAudioUrl,
      slowUrl: slowAudioUrl,
    }),
  );
  const grade = useMemo(
    () => (AI_GRADING_ENABLED ? gradeWithServer(sentenceId) : undefined),
    [sentenceId],
  );
  const saveMarkDone = useMemo(
    () => () => markLessonDone(sentenceId),
    [sentenceId],
  );
  const player = useLessonPlayer({ media, grade, markDone: saveMarkDone });
  const { state, step, recordingBusy } = player;

  return (
    <div className="w-full max-w-2xl space-y-6">
      <StepIndicator
        current={state.step}
        furthest={state.furthestStep}
        round={step.round}
        disabled={recordingBusy}
        onSelect={player.goTo}
      />

      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold">{STEP_TITLES[step.type]}</h2>
        <p className="text-sm text-muted-foreground">
          {STEP_INSTRUCTIONS[step.type]}
        </p>
      </div>

      <LessonText
        step={step}
        japaneseText={japaneseText}
        kanaText={kanaText}
        englishTranslation={englishTranslation}
      />

      {step.records ? (
        <FinalRecording player={player} />
      ) : (
        <Button
          onClick={player.play}
          disabled={state.playback.status === "countdown"}
          size="lg"
          className={cn(
            "h-14 w-full",
            state.playback.status === "countdown" && "animate-pulse",
          )}
        >
          {state.playback.status === "countdown"
            ? `Starting in ${state.playback.secondsLeft}...`
            : `Play ${step.speed === "slow" ? "Slow" : "Natural"} Native Audio`}
        </Button>
      )}

      <div className="flex gap-3">
        <Button
          onClick={player.previous}
          disabled={state.step === 1 || recordingBusy}
          variant="outline"
          size="lg"
          className="h-12 flex-1"
        >
          <ArrowLeft />
          Previous step
        </Button>

        {state.step < STEP_COUNT ? (
          <Button
            onClick={player.next}
            variant="outline"
            size="lg"
            className="h-12 flex-1"
          >
            Next step
            <ArrowRight />
          </Button>
        ) : (
          <Button
            onClick={player.restart}
            disabled={
              recordingBusy || state.finalRecording.status === "grading"
            }
            variant="outline"
            size="lg"
            className="h-12 flex-1"
          >
            <RotateCcw />
            Restart
          </Button>
        )}
      </div>
    </div>
  );
}

function StepIndicator({
  current,
  furthest,
  round,
  disabled,
  onSelect,
}: {
  current: StepNumber;
  furthest: StepNumber;
  round: Step["round"];
  disabled: boolean;
  onSelect: (step: number) => void;
}) {
  const roundLabel =
    round === "slow"
      ? "Slow Round"
      : round === "natural"
        ? "Natural Round"
        : "Final Recording";

  return (
    <nav aria-label="Lesson Steps" className="space-y-2">
      <p className="text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Step {current} of {STEP_COUNT} · {roundLabel}
      </p>
      <ol className="grid grid-cols-7 gap-1">
        {Array.from({ length: STEP_COUNT }, (_, index) => {
          const number = (index + 1) as StepNumber;
          return (
            <li key={number}>
              <Button
                onClick={() => onSelect(number)}
                disabled={disabled || number > furthest}
                variant={number === current ? "default" : "outline"}
                size="sm"
                className="w-full"
                aria-current={number === current ? "step" : undefined}
                aria-label={`Step ${number}: ${STEP_TITLES[getStep(number).type]}`}
              >
                {number}
              </Button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function LessonText({
  step,
  japaneseText,
  kanaText,
  englishTranslation,
}: {
  step: Step;
  japaneseText: string;
  kanaText: string;
  englishTranslation: string;
}) {
  const { shows } = step;

  if (!shows.sentence && !shows.kana && !shows.translation) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        No text in this Step. Shadow from listening.
      </div>
    );
  }

  return (
    <div className="flex min-h-32 flex-col items-center justify-center space-y-3 text-center">
      {shows.sentence && (
        <p className="text-3xl leading-relaxed font-bold tracking-tight sm:text-4xl">
          {japaneseText}
        </p>
      )}
      {shows.kana && (
        <p className="text-base text-muted-foreground sm:text-lg">{kanaText}</p>
      )}
      {shows.translation && (
        <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          {englishTranslation}
        </p>
      )}
    </div>
  );
}

function FinalRecording({
  player,
}: {
  player: ReturnType<typeof useLessonPlayer>;
}) {
  const { finalRecording } = player.state;
  const { markDoneState, recordingBusy } = player;
  const recording =
    "recording" in finalRecording ? finalRecording.recording : null;
  const error = "error" in finalRecording ? finalRecording.error : null;
  const result =
    finalRecording.status === "graded" ? finalRecording.result : null;
  const isGrading = finalRecording.status === "grading";

  return (
    <div className="space-y-4">
      {finalRecording.status === "countdown" ? (
        <Button disabled size="lg" className="h-14 w-full animate-pulse">
          Starting in {finalRecording.secondsLeft}...
        </Button>
      ) : finalRecording.status === "recording" ? (
        <Button disabled size="lg" className="h-14 w-full animate-pulse">
          Recording...
        </Button>
      ) : (
        <Button
          onClick={player.record}
          disabled={isGrading}
          size="lg"
          className="h-14 w-full"
        >
          {recording ? "Record Again" : "Record Shadowing"}
        </Button>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {recording && (
        <div className="space-y-4 rounded-2xl border bg-muted/40 p-4">
          <p className="text-sm font-medium">Your recording</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={player.playRecording}
              disabled={isGrading}
              variant="outline"
            >
              Play My Recording
            </Button>

            <Button
              onClick={player.playBoth}
              disabled={isGrading}
              variant="outline"
            >
              Play Both
            </Button>

            {!player.gradingAvailable ? null : !result ? (
              <Button
                onClick={player.submitForGrading}
                disabled={isGrading}
                className="sm:col-span-2"
              >
                {isGrading ? "Analyzing..." : "Submit Attempt"}
              </Button>
            ) : (
              <Button disabled variant="secondary" className="sm:col-span-2">
                Attempt Graded
              </Button>
            )}
          </div>

          {result && (
            <div className="rounded-xl border bg-background p-4">
              <p className="text-2xl font-bold">
                Accuracy Score: {result.accuracyScore}%
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {getFeedbackMessage(result.accuracyScore)}
              </p>

              {result.transcript && (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Whisper heard: {result.transcript}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Button
          onClick={player.markDone}
          disabled={markDoneState.status !== "idle" || recordingBusy}
          variant="secondary"
          size="lg"
          className="h-12 w-full"
        >
          {markDoneState.status === "saving"
            ? "Saving..."
            : markDoneState.status === "done"
              ? "Marked done"
              : "Mark Done"}
        </Button>

        {markDoneState.status === "idle" && markDoneState.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {markDoneState.error}
          </div>
        )}
      </div>
    </div>
  );
}

function gradeWithServer(sentenceId: string): GradeRecording {
  return async ({ blob }) => {
    const formData = new FormData();
    const filename = blob.type.startsWith("audio/mp4")
      ? "recording.m4a"
      : "recording.webm";
    formData.append("audio", blob, filename);

    const response = await checkPronunciation(formData, sentenceId);

    return response.success
      ? {
          ok: true,
          result: {
            accuracyScore: response.score ?? 0,
            transcript: response.receivedText ?? null,
          },
        }
      : {
          ok: false,
          error:
            response.error || "Grading engine returned a processing error.",
        };
  };
}

function getFeedbackMessage(score: number): string {
  if (score === 100) {
    return "Perfect! You said it perfectly. 🎉";
  }

  if (score >= 95) {
    return "Excellent! Nearly identical to the target sentence.";
  }

  if (score >= 85) {
    return "Great job! Just a few small differences detected.";
  }

  if (score >= 70) {
    return "Good attempt. You're close, but some words were interpreted differently.";
  }

  if (score >= 50) {
    return "Decent start. Try speaking more clearly and matching the rhythm.";
  }

  return "Keep practicing. Whisper had trouble matching your recording to the target sentence.";
}
