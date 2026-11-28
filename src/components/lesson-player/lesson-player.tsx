"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import {
  checkPronunciation,
  markLessonDone,
} from "@/app/protected/sentences/actions";
import { Button } from "@/components/ui/button";
import { LessonTags } from "@/components/sentences/lesson-tags";
import {
  createBrowserLessonMedia,
  STEP_COUNT,
  useLessonPlayer,
  type GradeRecording,
  type Step,
} from "@/lib/lesson-player";
import { cn } from "@/lib/utils";
import {
  FinalRecordingPanel,
  MarkDoneButton,
  RecordButton,
} from "./final-recording";
import { HOME_HREF, LESSONS_HREF, LessonExit } from "./lesson-exit";
import { LessonShadowed } from "./lesson-shadowed";
import { SentenceBlock } from "./sentence-block";
import { STEP_NAMES, STEP_TIPS, stepKicker } from "./step-copy";
import { StepTrail } from "./step-trail";

/**
 * AI grading is switched off while the app focuses on shadowing itself.
 * Set to true to bring back grading for signed-up Learners.
 */
const AI_GRADING_ENABLED = false;

type Player = ReturnType<typeof useLessonPlayer>;

interface LessonPlayerProps {
  lesson: {
    id: string;
    sentence: string;
    kana: string;
    translation: string;
    jlptLevel: string | null;
    category: string | null;
  };
  naturalAudioUrl: string;
  slowAudioUrl: string;
  /** Shadowing Attempts before this visit; null if they couldn't be loaded. */
  shadowingAttemptCount: number | null;
}

export function LessonPlayer({
  lesson,
  naturalAudioUrl,
  slowAudioUrl,
  shadowingAttemptCount,
}: LessonPlayerProps) {
  // One adapter per Lesson: recreating it would revoke the current Recording.
  // The page keys this component by Lesson, so new props mean a new mount.
  const [media] = useState(() =>
    createBrowserLessonMedia({
      naturalUrl: naturalAudioUrl,
      slowUrl: slowAudioUrl,
    }),
  );
  const [attemptsSaved, setAttemptsSaved] = useState(0);
  const grade = useMemo(
    () => (AI_GRADING_ENABLED ? gradeWithServer(lesson.id) : undefined),
    [lesson.id],
  );
  const saveMarkDone = useMemo(
    () => async () => {
      const outcome = await markLessonDone(lesson.id);
      if (outcome.ok) setAttemptsSaved((count) => count + 1);
      return outcome;
    },
    [lesson.id],
  );
  const player = useLessonPlayer({ media, grade, markDone: saveMarkDone });
  const { state, step, lessonShadowed } = player;
  const confirmLeave = player.needsLeaveConfirmation && { step: state.step };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
      <header className="flex items-center gap-2 px-4 pt-3 pb-1 md:gap-3.5 md:px-8 md:pt-4.5">
        <LessonExit
          href={LESSONS_HREF}
          confirm={confirmLeave}
          aria-label="Back to Lessons"
          variant="secondary"
          size="icon-lg"
          shape="pill"
          className="size-11 md:hidden"
        >
          <ChevronLeft aria-hidden />
        </LessonExit>
        <LessonExit
          href={LESSONS_HREF}
          confirm={confirmLeave}
          variant="ghost"
          size="lg"
          shape="pill"
          className="hidden text-body md:inline-flex"
        >
          <ChevronLeft aria-hidden />
          Lessons
        </LessonExit>
        <div className="flex gap-1.5">
          <LessonTags lesson={lesson} />
        </div>
        <p className="ml-auto text-caption text-neutral-700">
          {lessonShadowed
            ? "Lesson complete"
            : `Step ${state.step} of ${STEP_COUNT}`}
        </p>
        <LessonExit
          href={HOME_HREF}
          confirm={confirmLeave}
          aria-label="Close Lesson"
          variant="secondary"
          size="icon-lg"
          shape="pill"
          className="size-11 md:size-10"
        >
          <X aria-hidden />
        </LessonExit>
      </header>

      <div className="px-5 pt-3 md:px-10 md:pt-1.5">
        <StepTrail
          current={state.step}
          complete={lessonShadowed}
          canGoTo={player.canGoTo}
          onSelect={player.goTo}
        />
      </div>

      <div className="flex flex-1 flex-col md:px-8 md:pt-5.5 md:pb-8">
        <section className="relative flex flex-1 flex-col gap-4 overflow-hidden px-5 pt-4.5 pb-4 md:gap-6 md:rounded-3xl md:bg-card md:px-11 md:py-9">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-27.5 -right-22.5 hidden size-75 rounded-full bg-accent-2-200 opacity-55 md:block"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -top-12.5 right-30 hidden size-27.5 rounded-full bg-accent-200 opacity-60 md:block"
          />

          {lessonShadowed ? (
            <div className="relative flex flex-1 flex-col">
              <LessonShadowed
                shadowingAttemptCount={
                  shadowingAttemptCount === null
                    ? null
                    : shadowingAttemptCount + attemptsSaved
                }
                onShadowAgain={player.restart}
              />
            </div>
          ) : (
            <>
              <StepHeader step={step} />
              <div className="relative flex flex-1 flex-col gap-4 md:gap-6">
                {step.records ? (
                  <FinalRecordingPanel player={player} />
                ) : (
                  <>
                    <SentenceBlock
                      shows={step.shows}
                      sentence={lesson.sentence}
                      kana={lesson.kana}
                      translation={lesson.translation}
                    />
                    <DesktopPlayControls player={player} />
                  </>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {!lessonShadowed && <MobileTray player={player} />}
    </div>
  );
}

function StepHeader({ step }: { step: Step }) {
  return (
    <div className="relative flex max-w-155 flex-col gap-1 md:gap-1.5">
      <p className="text-label font-bold tracking-widest text-accent-700 uppercase md:text-xs">
        {stepKicker(step)}
      </p>
      <h2 className="text-2xl md:text-3xl">{STEP_NAMES[step.type]}</h2>
      <p className="text-sm text-pretty text-neutral-800 md:text-body">
        {STEP_TIPS[step.type]}
      </p>
    </div>
  );
}

function PlayButton({
  player,
  className,
}: {
  player: Player;
  className?: string;
}) {
  const { playback } = player.state;
  const counting = playback.status === "countdown";

  return (
    <Button
      onClick={player.play}
      disabled={counting}
      aria-label={`Play ${speedLabel(player.step)}`}
      shape="pill"
      className={cn(
        "size-18 shrink-0 p-0 font-heading text-2xl shadow-md disabled:opacity-100 md:size-17 [&_svg:not([class*='size-'])]:size-7",
        counting && "animate-pulse",
        className,
      )}
    >
      {counting ? (
        playback.secondsLeft
      ) : (
        <Play aria-hidden className="ml-0.5 fill-current" />
      )}
    </Button>
  );
}

/** Icon-only in the mobile tray, labelled on desktop. */
type StepButtonProps = { player: Player; iconOnly?: boolean };

const TRAY_ICON_BUTTON = "size-12 [&_svg:not([class*='size-'])]:size-5";

function PreviousStepButton({ player, iconOnly = false }: StepButtonProps) {
  return (
    <Button
      onClick={player.previous}
      disabled={player.state.step === 1}
      aria-label={iconOnly ? "Previous Step" : undefined}
      variant="secondary"
      shape="pill"
      size={iconOnly ? "icon-lg" : "lg"}
      className={iconOnly ? TRAY_ICON_BUTTON : "h-12 px-5 text-body"}
    >
      {iconOnly ? <ChevronLeft aria-hidden /> : "Back"}
    </Button>
  );
}

function NextStepButton({ player, iconOnly = false }: StepButtonProps) {
  const label = nextLabel(player.state.step);
  return (
    <Button
      onClick={player.next}
      aria-label={iconOnly ? label : undefined}
      shape="pill"
      size={iconOnly ? "icon-lg" : "lg"}
      className={iconOnly ? TRAY_ICON_BUTTON : "h-12 px-5.5 text-base"}
    >
      {iconOnly ? (
        <ChevronRight aria-hidden />
      ) : (
        <>
          {label}
          <ArrowRight aria-hidden />
        </>
      )}
    </Button>
  );
}

function DesktopPlayControls({ player }: { player: Player }) {
  return (
    <div className="relative hidden items-center gap-3.5 md:flex">
      <PlayButton player={player} />
      <PlaybackLabel player={player} />
      <div className="ml-auto flex items-center gap-2.5">
        <PreviousStepButton player={player} />
        <NextStepButton player={player} />
      </div>
    </div>
  );
}

function MobileTray({ player }: { player: Player }) {
  const { step } = player;

  return (
    <div className="sticky bottom-0 z-10 flex flex-col gap-3.5 rounded-t-card bg-card px-5 pt-4 pb-7 md:hidden">
      {step.records ? (
        <>
          <RecordButton player={player} className="w-full" />
          <MarkDoneButton player={player} />
        </>
      ) : (
        <>
          <PlaybackLabel player={player} />
          <div className="flex items-center justify-between">
            <PreviousStepButton player={player} iconOnly />
            <PlayButton player={player} />
            <NextStepButton player={player} iconOnly />
          </div>
        </>
      )}
    </div>
  );
}

function PlaybackLabel({ player }: { player: Player }) {
  const { playback } = player.state;

  return (
    <div className="flex justify-between text-xs text-neutral-700 md:flex-col md:justify-start md:text-caption">
      <span className="font-bold text-foreground md:text-body">
        {speedLabel(player.step)}
      </span>
      <span>
        {playback.status === "countdown"
          ? `Starting in ${playback.secondsLeft}...`
          : "Press play · replay as often as you like"}
      </span>
    </div>
  );
}

function speedLabel(step: Step): string {
  return step.speed === "slow" ? "Slow Native Audio" : "Natural Native Audio";
}

function nextLabel(step: number): string {
  if (step === 3) return "Start Natural Round";
  if (step === 6) return "Go to Final Recording";
  return "Next Step";
}

function gradeWithServer(lessonId: string): GradeRecording {
  return async ({ blob }) => {
    const formData = new FormData();
    const filename = blob.type.startsWith("audio/mp4")
      ? "recording.m4a"
      : "recording.webm";
    formData.append("audio", blob, filename);

    const response = await checkPronunciation(formData, lessonId);

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
