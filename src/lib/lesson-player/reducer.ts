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

export type PlayerState =
  | { status: "idle"; error: string | null }
  | { status: "countdown"; secondsLeft: number }
  | { status: "recording" }
  | { status: "recorded"; recording: Recording; error: string | null }
  | { status: "grading"; recording: Recording }
  | { status: "graded"; recording: Recording; result: GradingResult };

export type PlayerAction =
  | { type: "recordRequested" }
  | { type: "countdownTicked" }
  | { type: "captureFailed" }
  | { type: "recordingFinished"; recording: Recording }
  | { type: "gradingStarted" }
  | { type: "gradingSucceeded"; result: GradingResult }
  | { type: "gradingFailed"; error: string };

export const COUNTDOWN_SECONDS = 3;

export const initialPlayerState: PlayerState = { status: "idle", error: null };

/** Recording is possible when nothing is in progress; re-recording is allowed. */
export function canRecord(state: PlayerState): boolean {
  return (
    state.status === "idle" ||
    state.status === "recorded" ||
    state.status === "graded"
  );
}

export function playerReducer(
  state: PlayerState,
  action: PlayerAction,
): PlayerState {
  switch (action.type) {
    case "recordRequested":
      // Re-recording throws away the previous Recording and its result.
      return canRecord(state)
        ? { status: "countdown", secondsLeft: COUNTDOWN_SECONDS }
        : state;

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
  | { type: "confirmationEnded" };

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
  }
}
