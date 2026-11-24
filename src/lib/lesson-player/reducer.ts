import { getStep, STEP_COUNT, type StepNumber } from "./steps";

/**
 * A Learner's Recording, held only in the browser (ADR 0001).
 * `url` is an object URL for playing it back.
 */
export interface Recording {
  blob: Blob;
  url: string;
}

export interface GradingResult {
  accuracyScore: number;
  transcript: string | null;
}

export const COUNTDOWN_SECONDS = 3;

/** The countdown before Native Audio plays in a speaking Step (2, 3, 5, 6). */
type PlaybackState =
  { status: "idle" } | { status: "countdown"; secondsLeft: number };

/** The Recording in the Final Recording Step. */
export type FinalRecordingState =
  | { status: "idle"; error: string | null }
  | { status: "countdown"; secondsLeft: number }
  | { status: "recording" }
  | { status: "recorded"; recording: Recording; error: string | null }
  | { status: "grading"; recording: Recording }
  | { status: "graded"; recording: Recording; result: GradingResult };

/**
 * One visit to a Lesson. It always starts at Step 1 and is never saved.
 * The Learner can return to any Step up to `furthestStep`, never beyond it.
 */
export interface LessonState {
  step: StepNumber;
  furthestStep: StepNumber;
  playback: PlaybackState;
  finalRecording: FinalRecordingState;
}

type FinalRecordingAction =
  | { type: "recordRequested" }
  | { type: "countdownTicked" }
  | { type: "captureFailed" }
  | { type: "recordingFinished"; recording: Recording }
  | { type: "gradingStarted" }
  | { type: "gradingSucceeded"; result: GradingResult }
  | { type: "gradingFailed"; error: string };

export type LessonAction =
  | { type: "next" }
  | { type: "previous" }
  | { type: "goTo"; step: number }
  | { type: "restart" }
  | { type: "playRequested" }
  | { type: "playCountdownTicked" }
  | FinalRecordingAction;

const idlePlayback: PlaybackState = { status: "idle" };

export const initialLessonState: LessonState = {
  step: 1,
  furthestStep: 1,
  playback: idlePlayback,
  finalRecording: { status: "idle", error: null },
};

/**
 * Recording is possible in the Final Recording when nothing is in progress.
 * Re-recording is allowed. No other Step uses the microphone.
 */
export function canRecord(state: LessonState): boolean {
  const { status } = state.finalRecording;
  return (
    getStep(state.step).records &&
    (status === "idle" || status === "recorded" || status === "graded")
  );
}

/** A countdown or Recording in progress keeps the Learner in Step 7. */
export function isRecordingBusy(state: LessonState): boolean {
  const { status } = state.finalRecording;
  return status === "countdown" || status === "recording";
}

function isStepNumber(step: number): step is StepNumber {
  return Number.isInteger(step) && step >= 1 && step <= STEP_COUNT;
}

function moveTo(state: LessonState, step: number): LessonState {
  if (!isStepNumber(step) || step === state.step) return state;
  if (step > state.furthestStep + 1 || isRecordingBusy(state)) return state;
  return {
    ...state,
    step,
    furthestStep: step > state.furthestStep ? step : state.furthestStep,
    // Changing Step cancels a countdown that hasn't finished.
    playback: idlePlayback,
  };
}

export function lessonReducer(
  state: LessonState,
  action: LessonAction,
): LessonState {
  switch (action.type) {
    case "next":
      return moveTo(state, state.step + 1);

    case "previous":
      return moveTo(state, state.step - 1);

    case "goTo":
      // The step indicator can't skip ahead: only Steps already reached.
      return action.step <= state.furthestStep
        ? moveTo(state, action.step)
        : state;

    case "restart":
      // A fresh run: back to Step 1, and the Recording is thrown away.
      // Not mid-recording, and not while grading still needs the Recording.
      return isRecordingBusy(state) || state.finalRecording.status === "grading"
        ? state
        : initialLessonState;

    case "playRequested": {
      const step = getStep(state.step);
      // Listen plays straight away; the Final Recording plays by recording.
      if (!step.countdown || step.records) return state;
      if (state.playback.status === "countdown") return state;
      return {
        ...state,
        playback: { status: "countdown", secondsLeft: COUNTDOWN_SECONDS },
      };
    }

    case "playCountdownTicked":
      if (state.playback.status !== "countdown") return state;
      return {
        ...state,
        playback:
          state.playback.secondsLeft > 1
            ? {
                status: "countdown",
                secondsLeft: state.playback.secondsLeft - 1,
              }
            : idlePlayback,
      };

    case "recordRequested":
      // Re-recording throws away the previous Recording and its result.
      if (!canRecord(state)) return state;
      return {
        ...state,
        finalRecording: { status: "countdown", secondsLeft: COUNTDOWN_SECONDS },
      };

    default: {
      const finalRecording = finalRecordingReducer(
        state.finalRecording,
        action,
      );
      return finalRecording === state.finalRecording
        ? state
        : { ...state, finalRecording };
    }
  }
}

function finalRecordingReducer(
  state: FinalRecordingState,
  action: Exclude<FinalRecordingAction, { type: "recordRequested" }>,
): FinalRecordingState {
  switch (action.type) {
    case "countdownTicked":
      if (state.status !== "countdown") return state;
      return state.secondsLeft > 1
        ? { status: "countdown", secondsLeft: state.secondsLeft - 1 }
        : { status: "recording" };

    case "captureFailed":
      if (state.status !== "recording") return state;
      return { status: "idle", error: "Microphone access denied." };

    case "recordingFinished":
      if (state.status !== "recording") return state;
      return { status: "recorded", recording: action.recording, error: null };

    case "gradingStarted":
      if (state.status !== "recorded") return state;
      return { status: "grading", recording: state.recording };

    case "gradingSucceeded":
      if (state.status !== "grading") return state;
      return {
        status: "graded",
        recording: state.recording,
        result: action.result,
      };

    case "gradingFailed":
      if (state.status !== "grading") return state;
      return {
        status: "recorded",
        recording: state.recording,
        error: action.error,
      };
  }
}

/**
 * Mark Done is separate from the Recording states: it doesn't need a
 * Recording, and it can be pressed again once the confirmation has passed.
 */
export type MarkDoneState =
  | { status: "idle"; error: string | null }
  | { status: "saving" }
  | { status: "done" };

export type MarkDoneAction =
  | { type: "markDoneRequested" }
  | { type: "markDoneSucceeded" }
  | { type: "markDoneFailed"; error: string }
  | { type: "confirmationEnded" }
  | { type: "restarted" };

export const initialMarkDoneState: MarkDoneState = {
  status: "idle",
  error: null,
};

export function markDoneReducer(
  state: MarkDoneState,
  action: MarkDoneAction,
): MarkDoneState {
  switch (action.type) {
    case "markDoneRequested":
      return state.status === "idle" ? { status: "saving" } : state;

    case "markDoneSucceeded":
      return state.status === "saving" ? { status: "done" } : state;

    case "markDoneFailed":
      return state.status === "saving"
        ? { status: "idle", error: action.error }
        : state;

    case "confirmationEnded":
      return state.status === "done" ? initialMarkDoneState : state;

    case "restarted":
      // A save in progress still finishes; anything else starts fresh.
      return state.status === "saving" ? state : initialMarkDoneState;
  }
}
