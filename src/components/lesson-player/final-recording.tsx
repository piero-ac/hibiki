"use client";

import { Check, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { useLessonPlayer } from "@/lib/lesson-player";
import { cn } from "@/lib/utils";

type Player = ReturnType<typeof useLessonPlayer>;

/** The Final Recording's Recording status, play-back and messages. */
export function FinalRecordingPanel({ player }: { player: Player }) {
  const { finalRecording } = player.state;
  const recording =
    "recording" in finalRecording ? finalRecording.recording : null;
  const error = "error" in finalRecording ? finalRecording.error : null;
  const isGrading = finalRecording.status === "grading";
  const result =
    finalRecording.status === "graded" ? finalRecording.result : null;

  return (
    <div className="grid flex-1 gap-7 md:grid-cols-[minmax(0,1fr)_260px]">
      <div className="flex flex-col justify-center gap-3 md:gap-4">
        <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3 text-xs md:rounded-3xl md:bg-background md:px-5 md:py-4 md:text-caption">
          <span className="font-bold">Your Recording</span>
          <span className="text-neutral-700">
            {recordingStatus(finalRecording)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <RecordButton player={player} className="hidden md:inline-flex" />
          {recording && (
            <div className="grid flex-1 grid-cols-2 gap-2 md:flex md:flex-none md:gap-3">
              <Button
                onClick={player.playBoth}
                disabled={isGrading}
                variant="secondary"
                shape="pill"
                size="lg"
                className="h-11 md:px-5"
              >
                Play together
              </Button>
              <Button
                onClick={player.playRecording}
                disabled={isGrading}
                variant="secondary"
                shape="pill"
                size="lg"
                className="h-11 md:px-5"
              >
                Play mine
              </Button>
            </div>
          )}
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <p className="text-xs text-neutral-700">
          Recordings stay in your browser and are never stored.
        </p>
      </div>

      <div className="hidden flex-col justify-end gap-3 md:flex">
        {player.gradingAvailable && (
          // Dormant while AI grading is switched off; Scores stay hidden.
          <Button
            onClick={player.submitForGrading}
            disabled={!recording || isGrading || result !== null}
            variant="secondary"
            shape="pill"
            size="lg"
            className="h-12"
          >
            {isGrading ? "Analyzing..." : "Grade my Recording"}
          </Button>
        )}
        <MarkDoneButton player={player} />
      </div>
    </div>
  );
}

/** Record & shadow: a 3-2-1 countdown, then records while Natural plays. */
export function RecordButton({
  player,
  className,
}: {
  player: Player;
  className?: string;
}) {
  const { finalRecording } = player.state;
  const busy = player.recordingBusy;
  const label =
    finalRecording.status === "countdown"
      ? `Starting in ${finalRecording.secondsLeft}...`
      : finalRecording.status === "recording"
        ? "Recording..."
        : "recording" in finalRecording
          ? "Re-record"
          : "Record & shadow";

  return (
    <Button
      onClick={player.record}
      disabled={busy || finalRecording.status === "grading"}
      shape="pill"
      size="lg"
      className={cn(
        "h-14 gap-2.5 font-heading text-lead shadow-md md:h-15 md:pr-6 md:pl-2 md:text-base [&_svg:not([class*='size-'])]:size-5",
        busy && "bg-accent-700 ring-8 ring-accent-200 disabled:opacity-100",
        finalRecording.status === "recording" && "animate-pulse",
        className,
      )}
    >
      <span className="contents md:grid md:size-11 md:place-items-center md:rounded-full md:bg-background md:text-primary">
        <Mic aria-hidden />
      </span>
      {label}
    </Button>
  );
}

export function MarkDoneButton({ player }: { player: Player }) {
  const { markDoneState } = player;

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={player.markDone}
        disabled={markDoneState.status !== "idle" || player.recordingBusy}
        shape="pill"
        size="lg"
        className="h-12 text-base md:h-13 md:text-lead"
      >
        <Check aria-hidden />
        {markDoneState.status === "saving" ? "Saving..." : "Mark Done"}
      </Button>
      {markDoneState.status === "idle" && markDoneState.error && (
        <ErrorMessage>{markDoneState.error}</ErrorMessage>
      )}
    </div>
  );
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {children}
    </p>
  );
}

function recordingStatus(
  finalRecording: Player["state"]["finalRecording"],
): string {
  switch (finalRecording.status) {
    case "idle":
      return "Not recorded yet";
    case "countdown":
      return `Starting in ${finalRecording.secondsLeft}...`;
    case "recording":
      return "Recording...";
    default:
      return "Ready to play back";
  }
}
