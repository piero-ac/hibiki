"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { LessonMedia, Speed } from "./media";
import {
  COUNTDOWN_SECONDS,
  initialPlayerState,
  playerReducer,
  type GradingResult,
  type Recording,
} from "./reducer";

const RECORDING_VOLUME = 0.25;
/** Keep capturing briefly after Natural ends so the Learner's last mora isn't cut off. */
const AUTO_STOP_DELAY_MS = 600;

type GradeOutcome =
  { ok: true; result: GradingResult } | { ok: false; error: string };

/** Submits a Recording for an AI Grading Attempt. */
export type GradeRecording = (recording: Recording) => Promise<GradeOutcome>;

interface UseLessonPlayerOptions {
  media: LessonMedia;
  /** Leave out to make AI grading unavailable, as in Demo Mode. */
  grade?: GradeRecording;
}

export function useLessonPlayer({ media, grade }: UseLessonPlayerOptions) {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const capturingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
    };
  }, []);

  useEffect(() => {
    media.preload();
    return () => media.dispose();
  }, [media]);

  useEffect(() => {
    return media.onNaturalEnded(() => {
      if (!capturingRef.current) return;
      autoStopRef.current = setTimeout(async () => {
        autoStopRef.current = null;
        if (!capturingRef.current) return;
        capturingRef.current = false;
        try {
          const recording = await media.stopCapture();
          dispatch({ type: "recordingFinished", recording });
        } catch (error) {
          console.error(error);
          dispatch({ type: "captureFailed" });
        }
      }, AUTO_STOP_DELAY_MS);
    });
  }, [media]);

  const startRecording = useCallback(async () => {
    try {
      await media.startCapture();
    } catch (error) {
      console.error(error);
      dispatch({ type: "captureFailed" });
      return;
    }
    capturingRef.current = true;
    media.play("natural", { volume: RECORDING_VOLUME });
  }, [media]);

  const listen = useCallback(
    (speed: Speed) => media.play(speed, { volume: 1 }),
    [media],
  );

  const canRecord =
    state.status === "idle" ||
    state.status === "recorded" ||
    state.status === "graded";
  const currentRecording = "recording" in state ? state.recording : null;

  const record = useCallback(() => {
    if (!canRecord || countdownRef.current) return;
    // Recordings are thrown away when the Learner records again (ADR 0001).
    if (currentRecording) media.discard(currentRecording);
    media.stopPlayback();
    dispatch({ type: "recordRequested" });

    let secondsLeft = COUNTDOWN_SECONDS;
    countdownRef.current = setInterval(() => {
      secondsLeft -= 1;
      dispatch({ type: "countdownTicked" });
      if (secondsLeft === 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = null;
        void startRecording();
      }
    }, 1000);
  }, [canRecord, currentRecording, media, startRecording]);

  const playBoth = useCallback(() => {
    if (currentRecording) media.playWithRecording(currentRecording);
  }, [currentRecording, media]);

  const submitForGrading = useCallback(async () => {
    if (!grade || state.status !== "recorded") return;
    const { recording } = state;
    dispatch({ type: "gradingStarted" });

    try {
      const outcome = await grade(recording);
      dispatch(
        outcome.ok
          ? { type: "gradingSucceeded", result: outcome.result }
          : { type: "gradingFailed", error: outcome.error },
      );
    } catch (error) {
      console.error(error);
      dispatch({
        type: "gradingFailed",
        error: "Failed to communicate with grading server.",
      });
    }
  }, [grade, state]);

  return {
    state,
    gradingAvailable: grade !== undefined,
    listen,
    record,
    playBoth,
    submitForGrading,
  };
}
