"use client";

import { useMemo, useState } from "react";
import { checkPronunciation } from "@/app/protected/sentences/actions";
import { Button } from "@/components/ui/button";
import {
  createBrowserLessonMedia,
  useLessonPlayer,
  type GradeRecording,
} from "@/lib/lesson-player";

interface ShadowingPlayerProps {
  naturalAudioUrl: string;
  slowAudioUrl: string | null;
  sentenceId: string;
  isDemoUser?: boolean;
}

export default function SimpleShadowingPlayer({
  naturalAudioUrl,
  slowAudioUrl,
  sentenceId,
  isDemoUser,
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
    () => (isDemoUser ? undefined : gradeWithServer(sentenceId)),
    [isDemoUser, sentenceId],
  );
  const {
    state,
    gradingAvailable,
    playNativeAudio,
    record,
    playBoth,
    recordingPlayerRef,
    submitForGrading,
  } = useLessonPlayer({ media, grade });

  const isBusy = state.status === "countdown" || state.status === "recording";
  const recording = "recording" in state ? state.recording : null;
  const error = "error" in state ? state.error : null;
  const result = state.status === "graded" ? state.result : null;
  const isGrading = state.status === "grading";

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          onClick={() => playNativeAudio("slow")}
          disabled={!slowAudioUrl || isBusy}
          variant="outline"
          size="lg"
          className="h-14"
        >
          Listen Slow
        </Button>

        <Button
          onClick={() => playNativeAudio("natural")}
          disabled={isBusy}
          variant="outline"
          size="lg"
          className="h-14"
        >
          Listen Natural
        </Button>

        {state.status === "countdown" ? (
          <Button
            disabled
            size="lg"
            className="h-14 animate-pulse sm:col-span-2"
          >
            Starting in {state.secondsLeft}...
          </Button>
        ) : state.status === "recording" ? (
          <Button
            disabled
            size="lg"
            className="h-14 animate-pulse sm:col-span-2"
          >
            Recording...
          </Button>
        ) : (
          <Button
            onClick={record}
            disabled={isGrading}
            size="lg"
            className="h-14 sm:col-span-2"
          >
            Record Shadowing
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {recording && (
        <div className="space-y-4 rounded-2xl border bg-muted/40 p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Your recording</p>
            <audio
              ref={recordingPlayerRef}
              controls
              src={recording.url}
              className="w-full"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={playBoth} disabled={isGrading} variant="outline">
              Play Both
            </Button>

            {!gradingAvailable ? (
              <Button disabled variant="secondary">
                Demo Mode · AI Grading Unavailable
              </Button>
            ) : !result ? (
              <Button onClick={submitForGrading} disabled={isGrading}>
                {isGrading ? "Analyzing..." : "Submit Attempt"}
              </Button>
            ) : (
              <Button disabled variant="secondary">
                Attempt Graded
              </Button>
            )}
          </div>

          {result && (
            <div className="rounded-xl border bg-background p-4">
              <p className="text-2xl font-bold">
                Score: {result.accuracyScore}%
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
