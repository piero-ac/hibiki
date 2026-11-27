"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { LessonMedia } from "./media";
import {
  canRecord,
  COUNTDOWN_SECONDS,
  initialLessonState,
  initialMarkDoneState,
  isRecordingBusy,
  lessonReducer,
  markDoneReducer,
  type GradingResult,
  type LessonAction,
  type Recording,
} from "./reducer";
import { getStep } from "./steps";

const RECORDING_VOLUME = 0.25;
/** Keep capturing briefly after Natural ends so the Learner's last mora isn't cut off. */
const AUTO_STOP_DELAY_MS = 600;
/** How long "Marked done" shows before Mark Done can be pressed again. */
const MARKED_DONE_CONFIRMATION_MS = 2000;

type GradeOutcome =
  { ok: true; result: GradingResult } | { ok: false; error: string };

/** Submits a Recording for an AI Grading Attempt. */
export type GradeRecording = (recording: Recording) => Promise<GradeOutcome>;

export type MarkDoneOutcome = { ok: true } | { ok: false; error: string };

/** Records a Shadowing Attempt for this Lesson. */
export type MarkDone = () => Promise<MarkDoneOutcome>;

interface UseLessonPlayerOptions {
  media: LessonMedia;
  /** Leave out to make AI grading unavailable. */
  grade?: GradeRecording;
  markDone: MarkDone;
}

export function useLessonPlayer({
  media,
  grade,
  markDone: saveMarkDone,
}: UseLessonPlayerOptions) {
  const [state, dispatch] = useReducer(lessonReducer, initialLessonState);
  const [markDoneState, dispatchMarkDone] = useReducer(
    markDoneReducer,
    initialMarkDoneState,
  );
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const capturingRef = useRef(false);
  // Blocks a second press that lands before React re-renders.
  const markingDoneRef = useRef(false);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (playCountdownRef.current) clearInterval(playCountdownRef.current);
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      if (confirmationRef.current) clearTimeout(confirmationRef.current);
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

  const step = getStep(state.step);
  const recordingAllowed = canRecord(state);
  const currentRecording =
    "recording" in state.finalRecording ? state.finalRecording.recording : null;

  const clearPlayCountdown = useCallback(() => {
    if (playCountdownRef.current) clearInterval(playCountdownRef.current);
    playCountdownRef.current = null;
  }, []);

  /** Plays the Step's Native Audio: at once in Listen, after 3-2-1 otherwise. */
  const play = useCallback(() => {
    if (step.records || playCountdownRef.current) return;
    if (!step.countdown) {
      media.play(step.speed, { volume: 1 });
      return;
    }

    media.stopPlayback();
    dispatch({ type: "playRequested" });
    let secondsLeft = COUNTDOWN_SECONDS;
    playCountdownRef.current = setInterval(() => {
      secondsLeft -= 1;
      dispatch({ type: "playCountdownTicked" });
      if (secondsLeft === 0) {
        clearPlayCountdown();
        media.play(step.speed, { volume: 1 });
      }
    }, 1000);
  }, [step, media, clearPlayCountdown]);

  /** Changing Step stops the audio and any countdown that hasn't finished. */
  const move = useCallback(
    (action: LessonAction) => {
      // The reducer is pure, so it says up front whether the move is allowed.
      if (lessonReducer(state, action) === state) return;
      clearPlayCountdown();
      media.stopPlayback();
      dispatch(action);
    },
    [state, media, clearPlayCountdown],
  );

  const next = useCallback(() => move({ type: "next" }), [move]);
  const previous = useCallback(() => move({ type: "previous" }), [move]);
  const goTo = useCallback(
    (step: number) => move({ type: "goTo", step }),
    [move],
  );

  const restart = useCallback(() => {
    if (lessonReducer(state, { type: "restart" }) === state) return;
    // Recordings are thrown away when the Learner starts over (ADR 0001).
    if (currentRecording) media.discard(currentRecording);
    move({ type: "restart" });
    if (markDoneState.status !== "saving") {
      if (confirmationRef.current) clearTimeout(confirmationRef.current);
      confirmationRef.current = null;
      markingDoneRef.current = false;
    }
    dispatchMarkDone({ type: "restarted" });
  }, [state, currentRecording, media, move, markDoneState]);

  const record = useCallback(() => {
    if (!recordingAllowed || countdownRef.current) return;
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
  }, [recordingAllowed, currentRecording, media, startRecording]);

  const playRecording = useCallback(() => {
    if (currentRecording) media.playRecording(currentRecording);
  }, [currentRecording, media]);

  const playBoth = useCallback(() => {
    if (currentRecording) media.playWithRecording(currentRecording);
  }, [currentRecording, media]);

  const submitForGrading = useCallback(async () => {
    if (!grade || state.finalRecording.status !== "recorded") return;
    const { recording } = state.finalRecording;
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

  const markDone = useCallback(async () => {
    if (!step.records || markingDoneRef.current) return;
    markingDoneRef.current = true;
    dispatchMarkDone({ type: "markDoneRequested" });

    try {
      const outcome = await saveMarkDone();
      if (!outcome.ok) {
        markingDoneRef.current = false;
        dispatchMarkDone({ type: "markDoneFailed", error: outcome.error });
        return;
      }
    } catch (error) {
      console.error(error);
      markingDoneRef.current = false;
      dispatchMarkDone({
        type: "markDoneFailed",
        error: "Couldn't mark this Lesson done. Please try again.",
      });
      return;
    }

    dispatchMarkDone({ type: "markDoneSucceeded" });
    confirmationRef.current = setTimeout(() => {
      confirmationRef.current = null;
      markingDoneRef.current = false;
      dispatchMarkDone({ type: "confirmationEnded" });
    }, MARKED_DONE_CONFIRMATION_MS);
  }, [saveMarkDone, step]);

  return {
    state,
    /** What the current Step plays and shows. */
    step,
    /** A Final Recording countdown or Recording is running; Steps are locked. */
    recordingBusy: isRecordingBusy(state),
    markDoneState,
    gradingAvailable: grade !== undefined,
    play,
    next,
    previous,
    goTo,
    restart,
    record,
    playBoth,
    playRecording,
    submitForGrading,
    markDone,
  };
}
